# app.py - Cleaned and Consolidated Version
from flask import Flask, render_template, request, redirect, url_for, flash, session, get_flashed_messages
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from config import DB_CONFIG, SECRET_KEY # Assumed to be available
import logging
from datetime import timedelta

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = SECRET_KEY


def get_db_connection():
    """Return a new MySQL connection (dictionary cursor will be used where needed)."""
    return mysql.connector.connect(**DB_CONFIG)


def find_password_field(row_dict):
    """Utility to find the password field key in a DB row."""
    if not row_dict: return None, None
    for k in row_dict.keys():
        if 'pass' in k.lower() or 'pwd' in k.lower():
            return k, row_dict.get(k)
    return None, None

def get_case_insensitive(row, key_name):
    """Utility to safely retrieve a value from a DB row dictionary."""
    if not row: return None
    target = key_name.lower()
    for k, v in row.items():
        if k.lower() == target: return v
    target_plain = target.replace('_', '')
    for k, v in row.items():
        if k.lower().replace('_', '') == target_plain: return v
    for k, v in row.items():
        if k.lower().endswith('id'): return v
    return None

app = Flask(__name__)
app.secret_key = SECRET_KEY
# Set session lifetime (e.g., 31 days) for "Stay Signed In" feature
app.permanent_session_lifetime = timedelta(days=31)


# ---------------- ROUTES ---------------- #

@app.route('/')
def index():
    get_flashed_messages() 
    
    # NEW LOGIC: Check session and redirect to dashboard if logged in
    if session.get('user_type') == 'organizer':
        return redirect(url_for('organizer_dashboard'))
    elif session.get('user_type') == 'attendee':
        return redirect(url_for('attendee_dashboard'))
        
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for('index'))

# ---------- ORGANIZER AUTH & DASHBOARD ---------- #

@app.route('/organizer/signup', methods=['GET', 'POST'])
def organizer_signup():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        phone = request.form.get('phone', '').strip()

        if not (name and email and password):
            flash("Name, email and password are required.", "error")
            return redirect(url_for('organizer_signup'))

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM organizer WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close(); db.close()
            flash("Organizer already exists. Please log in.", "error")
            return redirect(url_for('organizer_login'))

        hashed = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO organizer (name, email, Password, phone) VALUES (%s, %s, %s, %s)",
            (name, email, hashed, phone)
        )
        db.commit()
        cursor.close(); db.close()
        flash("Organizer registered successfully. Please login.", "success")
        return redirect(url_for('organizer_login'))

    return render_template('organizer_signup.html')


@app.route('/organizer/login', methods=['GET', 'POST'])
def organizer_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        stay_signed_in = request.form.get('stay_signed_in')

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM organizer WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close(); db.close()

        if not user:
            flash("Invalid credentials", "error")
            return redirect(url_for('organizer_login'))

        # Fetch password and normalize
        pw_field_name, stored_pw = find_password_field(user)
        if stored_pw is None:
            flash("Account has no password set. Contact admin.", "error")
            return redirect(url_for('organizer_login'))
        if isinstance(stored_pw, (bytes, bytearray)): stored_pw = stored_pw.decode()
        
        verified = False
        if stored_pw == password: verified = True
        if not verified:
            try:
                if check_password_hash(stored_pw, password): verified = True
            except Exception: pass

        if verified:
            organizer_id = get_case_insensitive(user, 'organizer_id') or get_case_insensitive(user, 'id')
            
            if organizer_id is None:
                app.logger.error("Could not determine organizer id from DB row keys: %s", list(user.keys()))
                flash("Account record missing id field — contact admin.", "error")
                return redirect(url_for('organizer_login'))

            # FIX: Always set to False first, then set to True if box is checked
            session.permanent = bool(stay_signed_in)
            
            session['user_name'] = get_case_insensitive(user, 'name')
            session['user_id'] = organizer_id
            session['user_type'] = 'organizer'

            flash("Login successful.", "success") # Shortened message
            return redirect(url_for('organizer_dashboard'))
        else:
            flash("Invalid credentials", "error")
            return redirect(url_for('organizer_login'))

    return render_template('organizer_login.html')

@app.route('/organizer/dashboard')
def organizer_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'organizer':
        return redirect(url_for('organizer_login'))

    organizer_id = session.get('user_id')
    query = request.args.get('query', '').strip() # NEW: Get search query
    
    events = []
    db = None
    try:
        int_organizer_id = int(organizer_id)
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        
        sql = "SELECT Event_Id, Event_Name, Event_Description FROM Event WHERE Organizer_Id = %s"
        params = [int_organizer_id]
        
        if query:
            sql += " AND Event_Name LIKE %s"
            params.append(f"%{query}%")
            
        cursor.execute(sql, params)
        events = cursor.fetchall()
        cursor.close()
    
    except ValueError:
        flash("Session ID is corrupted. Please log in again.", "error")
        session.clear()
        return redirect(url_for('organizer_login'))
    except Exception as e:
        app.logger.error("Database error in organizer_dashboard: %s", e)
        flash("Could not load events: A database error occurred.", "error")
    finally:
        if db: db.close()
            
    return render_template('organizer_events.html', events=events)

# app.py (Modified organizer_event route - Replace existing function)

@app.route('/organizer/event/<int:event_id>')
def organizer_event(event_id):
    if 'user_id' not in session or session.get('user_type') != 'organizer':
        return redirect(url_for('organizer_login'))

    organizer_id = session.get('user_id')
    
    # Get filter parameters from the URL
    session_status = request.args.get('session_status', '')
    query = request.args.get('query', '').strip()

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT Event_Id, Event_Name, Organizer_Id FROM Event WHERE Event_Id = %s AND Organizer_Id = %s", (event_id, organizer_id))
    event = cursor.fetchone()
    if not event:
        cursor.close(); db.close()
        flash("Event not found or you don't have permission to view it.", "error")
        return redirect(url_for('organizer_dashboard'))

    try:
        session_query = """
            SELECT 
                s.Schedule_Id, s.Session_Name, s.Session_Date, s.Start_Time, s.End_Time, v.Name AS Venue_Name, v.Capacity,
                COUNT(r.Registration_Id) AS participants, (v.Capacity - COUNT(r.Registration_Id)) AS seats_left
            FROM Schedule s
            JOIN Venue v ON s.Venue_Id = v.Venue_Id
            LEFT JOIN Registrations r ON s.Schedule_Id = r.Schedule_Id
            WHERE s.Event_Id = %s
        """
        params = [event_id]
        
        where_conditions = []
        if query:
            where_conditions.append("s.Session_Name LIKE %s")
            params.append(f"%{query}%")

        if where_conditions:
            session_query += " AND " + " AND ".join(where_conditions)
        
        group_by = """
            GROUP BY s.Schedule_Id, s.Session_Name, s.Session_Date, s.Start_Time, s.End_Time, v.Name, v.Capacity
        """
        order_by = " ORDER BY s.Session_Date, s.Start_Time"

        # Status Filtering (HAVING clause)
        having_conditions = []
        if session_status == 'filled':
            having_conditions.append("COUNT(r.Registration_Id) >= v.Capacity")
        elif session_status == 'not_filled':
            having_conditions.append("COUNT(r.Registration_Id) < v.Capacity")
            
        having_clause = " HAVING " + " AND ".join(having_conditions) if having_conditions else ""
        
        full_query = session_query + group_by + having_clause + order_by

        cursor.execute(full_query, params)
        schedules = cursor.fetchall()
        
    except Exception as e:
        app.logger.error("Error fetching Schedule rows with participant count: %s", e)
        schedules = []

    cursor.close(); db.close()
    return render_template('organizer_event.html', event=event, schedules=schedules)


# app.py (Updated organizer_session_detail route)

@app.route('/organizer/session/detail/<int:schedule_id>')
def organizer_session_detail(schedule_id):
    if 'user_id' not in session or session.get('user_type') != 'organizer':
        return redirect(url_for('organizer_login'))

    organizer_id = session.get('user_id')
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    # NEW: Get search query parameter for filtering details
    query = request.args.get('query', '').strip()
    
    # --- 1. Fetch Schedule Details and Validate Organizer ---
    
    # Base query to fetch session details, event info, and capacity
    cursor.execute("""
        SELECT s.*, e.Event_Name, e.Organizer_Id, v.Name AS Venue_Name, v.Location, v.Capacity
        FROM Schedule s 
        JOIN Event e ON s.Event_Id = e.Event_Id 
        JOIN Venue v ON s.Venue_Id = v.Venue_Id
        WHERE s.Schedule_Id = %s
    """, (schedule_id,))
    
    schedule = cursor.fetchone() 
    
    if not schedule or schedule.get('Organizer_Id') != int(organizer_id):
        cursor.close(); db.close()
        flash("Session not found or you don't have permission.", "error")
        return redirect(url_for('organizer_dashboard')) 
    
    # --- 2. Calculate Dynamic Metrics (Participants/Seats Left) ---
    
    # Calculate participants
    cursor.execute("SELECT COUNT(Registration_Id) AS participants FROM Registrations WHERE Schedule_Id = %s", (schedule_id,))
    participants = cursor.fetchone()['participants']
    
    schedule['participants'] = participants
    schedule['seats_left'] = schedule.get('Capacity', 0) - participants # Calculate seats left
    
    # --- 3. Filter Tasks ---
    task_sql = "SELECT * FROM Tasks WHERE Schedule_Id = %s"
    task_params = [schedule_id]
    if query:
        task_sql += " AND Name LIKE %s"
        task_params.append(f"%{query}%")
    task_sql += " ORDER BY Task_Id"
    cursor.execute(task_sql, task_params)
    tasks = cursor.fetchall()
    
    # --- 4. Filter Budget Items and Vendors ---
    budget_sql = """
        SELECT bi.Budget_Item_Id, bi.Name, bi.Allocated_Amount, bi.Actual_Amount_Spent, 
               bi.Vendor_Id, t.Name AS task_name, v.Name AS Vendor_Name, v.Service_Type, v.Email, v.Phone_Number
        FROM Budget_Items bi 
        JOIN Tasks t ON bi.Task_Id = t.Task_Id 
        JOIN Vendors v ON bi.Vendor_Id = v.Vendor_Id
        WHERE t.Schedule_Id = %s
    """
    budget_params = [schedule_id]
    if query:
        # Filter budget items by name OR vendor name
        budget_sql += " AND (bi.Name LIKE %s OR v.Name LIKE %s)"
        budget_params.extend([f"%{query}%", f"%{query}%"])
        
    cursor.execute(budget_sql, budget_params)
    budget_vendor_data = cursor.fetchall()

    # Consolidate data for template
    budget_items = []
    vendors = {}
    
    for item in budget_vendor_data:
        # Populate Budget Items list
        budget_items.append({
            'Name': item['Name'], 
            'Allocated_Amount': item['Allocated_Amount'], 
            'Actual_Amount_Spent': item['Actual_Amount_Spent'], 
            'Vendor_Name': item['Vendor_Name'],
            'task_name': item['task_name']
        })
        # Consolidate Vendors (Filter is applied by the SQL query already)
        vendor_id = item['Vendor_Id']
        if vendor_id not in vendors:
            vendors[vendor_id] = {
                'Name': item['Vendor_Name'], 
                'Service_Type': item['Service_Type'], 
                'Email': item['Email'], 
                'Phone_Number': item['Phone_Number']
            }
                                  
    cursor.close(); db.close()
    
    # Render with the current search query included
    return render_template('organizer_session_detail.html', 
                           schedule=schedule, tasks=tasks, 
                           budget_items=budget_items, 
                           vendors=list(vendors.values()),
                           query=query)


@app.route('/organizer/task/<int:task_id>')
def organizer_task(task_id):
    if 'user_id' not in session or session.get('user_type') != 'organizer':
        return redirect(url_for('organizer_login'))

    organizer_id = session.get('user_id')
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT t.Task_Id, t.Name AS Task_Name, t.Status, t.Schedule_Id, s.Session_Name, s.Session_Date, e.Event_Name, e.Organizer_Id
        FROM Tasks t JOIN Schedule s ON t.Schedule_Id = s.Schedule_Id JOIN Event e ON s.Event_Id = e.Event_Id
        WHERE t.Task_Id = %s
    """, (task_id,))
    task = cursor.fetchone()

    if not task or task.get('Organizer_Id') != int(organizer_id):
        cursor.close(); db.close()
        flash("Task not found or you don't have permission to view it.", "error")
        return redirect(url_for('organizer_dashboard'))

    cursor.execute("""
        SELECT bi.Name AS Budget_Name, bi.Allocated_Amount, bi.Actual_Amount_Spent, v.Name AS Vendor_Name, v.Service_Type, v.Email, v.Phone_Number
        FROM Budget_Items bi JOIN Vendors v ON bi.Vendor_Id = v.Vendor_Id WHERE bi.Task_Id = %s
    """, (task_id,))
    task_details = cursor.fetchall()
    
    vendors = {}
    for item in task_details:
        vendor_name = item['Vendor_Name']
        if vendor_name not in vendors:
            vendors[vendor_name] = {'Name': vendor_name, 'Service_Type': item['Service_Type'], 'Email': item['Email'], 'Phone_Number': item['Phone_Number']}
            
    budget_items = [{'Name': td['Budget_Name'], 'Allocated_Amount': td['Allocated_Amount'], 'Actual_Amount_Spent': td['Actual_Amount_Spent'], 'Vendor_Name': td['Vendor_Name']} for td in task_details]

    cursor.close(); db.close()
    return render_template('organizer_task.html', task=task, budget_items=budget_items, vendors=list(vendors.values()))

# ---------- ATTENDEE AUTH & DASHBOARD ---------- #

@app.route('/attendee/signup', methods=['GET', 'POST'])
def attendee_signup():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        phone = request.form.get('phone', '').strip()

        if not (name and email and password):
            flash("Name, email and password are required.", "error")
            return redirect(url_for('attendee_signup'))

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Attendees WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close(); db.close()
            flash("Attendee already exists. Please login.", "error")
            return redirect(url_for('attendee_login'))

        hashed = generate_password_hash(password)
        cursor.execute("INSERT INTO Attendees (name, email, Password, phone) VALUES (%s, %s, %s, %s)", (name, email, hashed, phone))
        db.commit()
        cursor.close(); db.close()
        flash("Attendee registered successfully. Please login.", "success")
        return redirect(url_for('attendee_login'))

    return render_template('attendee_signup.html')


@app.route('/attendee/login', methods=['GET', 'POST'])
def attendee_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        stay_signed_in = request.form.get('stay_signed_in')

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Attendees WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close(); db.close()

        if not user:
            flash("Invalid credentials", "error")
            return redirect(url_for('attendee_login'))

        # Fetch password and normalize
        pw_field_name, stored_pw = find_password_field(user)
        if stored_pw is None:
            flash("Account has no password set. Contact admin.", "error")
            return redirect(url_for('attendee_login'))
        if isinstance(stored_pw, (bytes, bytearray)): stored_pw = stored_pw.decode()

        verified = False
        if stored_pw == password: verified = True
        if not verified:
            try:
                if check_password_hash(stored_pw, password): verified = True
            except Exception: pass

        if verified:
            attendee_id = get_case_insensitive(user, 'attendee_id') or get_case_insensitive(user, 'id')
            if attendee_id is None:
                flash("Account record missing id field — contact admin.", "error")
                return redirect(url_for('attendee_login'))

            # FIX: Always set to False first, then set to True if box is checked
            session.permanent = bool(stay_signed_in)

            session['user_name'] = get_case_insensitive(user, 'name')
            session['user_id'] = attendee_id
            session['user_type'] = 'attendee'

            flash("Login successful.", "success") # Shortened message
            return redirect(url_for('attendee_dashboard'))
        else:
            flash("Invalid credentials", "error")
            return redirect(url_for('attendee_login'))

    return render_template('attendee_login.html')

# app.py (Modified attendee_events_list route)

@app.route('/attendee/events')
def attendee_events_list():
    query = request.args.get('query', '').strip()
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    base_sql = "SELECT Event_Id, Event_Name, Event_Description FROM Event"
    params = []
    
    if query:
        base_sql += " WHERE Event_Name LIKE %s"
        params.append(f"%{query}%")
        
    base_sql += " ORDER BY Event_Name"

    cursor.execute(base_sql, params)
    events = cursor.fetchall()
    
    cursor.close(); db.close()
    return render_template('attendee_events.html', events=events)

@app.route('/attendee/dashboard')
def attendee_dashboard():
    if 'user_id' not in session or session.get('user_type') != 'attendee':
        return redirect(url_for('attendee_login'))

    attendee_id = session['user_id']
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Fetch user's name (omitted for brevity, assume correct)
    cursor.execute("SELECT Name FROM Attendees WHERE Attendee_Id = %s", (attendee_id,))
    user_data = cursor.fetchone()
    if user_data: session['user_name'] = user_data['Name']
    
    # --- START FILTERING LOGIC ---
    query = request.args.get('query', '').strip()
    filter_type = request.args.get('filter_type', 'event')
    session_status = request.args.get('session_status', '')

    base_query = """
        SELECT 
            e.Event_Name AS name, 
            s.Session_Name AS session_name,
            v.Name AS venue, 
            s.Session_Date AS date, 
            s.Start_Time AS time,
            s.Schedule_Id
        FROM Registrations r
        JOIN Schedule s ON r.Schedule_Id = s.Schedule_Id
        JOIN Event e ON s.Event_Id = e.Event_Id
        JOIN Venue v ON s.Venue_Id = v.Venue_Id
    """
    conditions = ["r.Attendee_Id = %s"]
    params = [attendee_id]

    if query:
        conditions.append("(e.Event_Name LIKE %s OR s.Session_Name LIKE %s)")
        params.extend([f"%{query}%", f"%{query}%"])

    if filter_type == 'session' and session_status:
        # Note: To filter by session status accurately, we need to know participants/capacity
        # This logic is simpler and assumes filtering on the currently displayed registered sessions.
        # For a more complete filter, you'd need a separate unfiltered query.
        pass # Leaving this empty to prevent complexity creep on the dashboard registered list.

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    full_query = base_query + where_clause + " ORDER BY s.Session_Date"

    try:
        cursor.execute(full_query, params)
        registered_events = cursor.fetchall()
    except Exception as e:
        app.logger.error("Error fetching registered events with filters: %s", e)
        registered_events = []
    
    cursor.close(); db.close()

    return render_template(
        'attendee_dashboard.html',
        registered_events=registered_events
    )
@app.route('/event/register/<int:event_id>', methods=['GET', 'POST'])
def register_event(event_id):
    flash("Please view the event sessions to register for a specific session.", "info")
    return redirect(url_for('attendee_event', event_id=event_id))

# app.py (New route to be added)

@app.route('/attendee/session/<int:schedule_id>')
def attendee_session_detail(schedule_id):
    attendee_id = session.get('user_id') if session.get('user_type') == 'attendee' else None
    is_logged_in = attendee_id is not None
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Fetch session details with event and venue info
    cursor.execute("""
        SELECT s.*, e.Event_Name, v.Name AS Venue_Name, v.Capacity,
               COUNT(r.Registration_Id) AS participants,
               (v.Capacity - COUNT(r.Registration_Id)) AS seats_left
        FROM Schedule s
        JOIN Event e ON s.Event_Id = e.Event_Id
        JOIN Venue v ON s.Venue_Id = v.Venue_Id
        LEFT JOIN Registrations r ON s.Schedule_Id = r.Schedule_Id
        WHERE s.Schedule_Id = %s
        GROUP BY s.Schedule_Id, e.Event_Name, v.Name, v.Capacity
    """, (schedule_id,))
    schedule = cursor.fetchone()

    if not schedule:
        cursor.close(); db.close()
        flash("Session not found.", "error")
        return redirect(url_for('attendee_dashboard'))
    
    schedule['registered'] = False
    if is_logged_in:
        cursor.execute(
            "SELECT Registration_Id FROM Registrations WHERE Schedule_Id = %s AND Attendee_Id = %s",
            (schedule_id, attendee_id)
        )
        schedule['registered'] = cursor.fetchone() is not None
        
    cursor.close(); db.close()
    return render_template('attendee_session_detail.html', schedule=schedule)

@app.route('/attendee/event/<int:event_id>')
def attendee_event(event_id):
    if 'user_id' not in session or session.get('user_type') != 'attendee':
        is_logged_in = False
        attendee_id = None
    else:
        is_logged_in = True
        attendee_id = session.get('user_id')
        
    # Get filter parameters
    session_status = request.args.get('session_status', '')
    query = request.args.get('query', '').strip() # Get session name search query
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT Event_Id, Event_Name FROM Event WHERE Event_Id = %s", (event_id,))
    event = cursor.fetchone()
    if not event:
        cursor.close(); db.close()
        flash("Event not found.", "error")
        return redirect(url_for('attendee_dashboard'))
    
    try:
        # Base SQL query structure
        session_query = """
            SELECT s.Schedule_Id, s.Session_Name, s.Session_Date, s.Start_Time, s.End_Time, v.Name AS Venue_Name, v.Capacity,
                   COUNT(r.Registration_Id) AS participants, (v.Capacity - COUNT(r.Registration_Id)) AS seats_left
            FROM Schedule s 
            JOIN Venue v ON s.Venue_Id = v.Venue_Id 
            LEFT JOIN Registrations r ON s.Schedule_Id = r.Schedule_Id
            WHERE s.Event_Id = %s
        """
        params = [event_id]
        
        where_conditions = []
        if query:
            # FIX: Add condition for session name search to the WHERE clause
            where_conditions.append("s.Session_Name LIKE %s")
            params.append(f"%{query}%") # Add search parameter to the list

        # Append additional WHERE conditions (if any)
        if where_conditions:
            session_query += " AND " + " AND ".join(where_conditions)
        
        group_by = """
            GROUP BY s.Schedule_Id, s.Session_Name, s.Session_Date, s.Start_Time, s.End_Time, v.Name, v.Capacity
        """
        order_by = """
            ORDER BY s.Session_Date, s.Start_Time
        """
        
        # --- Status Filtering Logic (using HAVING clause) ---
        having_conditions = []
        if session_status == 'filled':
            having_conditions.append("COUNT(r.Registration_Id) >= v.Capacity")
        elif session_status == 'not_filled':
            having_conditions.append("COUNT(r.Registration_Id) < v.Capacity")
            
        having_clause = " HAVING " + " AND ".join(having_conditions) if having_conditions else ""
        
        # Construct the final query
        full_query = session_query + group_by + having_clause + order_by

        cursor.execute(full_query, params)
        schedules = cursor.fetchall()
        
        # ... (omitted registration status check loop) ...
        
        if is_logged_in:
            for s in schedules:
                cursor.execute("SELECT Registration_Id FROM Registrations WHERE Schedule_Id = %s AND Attendee_Id = %s", (s['Schedule_Id'], attendee_id))
                s['registered'] = cursor.fetchone() is not None
        
    except Exception as e:
        app.logger.error("Error fetching sessions for attendee event view with filters: %s", e)
        schedules = []
    
    cursor.close(); db.close()
    return render_template('attendee_event.html', event=event, schedules=schedules)

@app.route('/attendee/register/<int:schedule_id>', methods=['POST'])
def attendee_register(schedule_id):
    if 'user_id' not in session or session.get('user_type') != 'attendee':
        flash("Login required to register.", "error") # Shortened message
        return redirect(url_for('attendee_login'))

    attendee_id = session['user_id']
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT Registration_Id FROM Registrations WHERE Schedule_Id = %s AND Attendee_Id = %s", (schedule_id, attendee_id))
    if cursor.fetchone():
        flash("Already registered.", "info") # Shortened message
        cursor.close(); db.close()
        return redirect(url_for('attendee_session_detail', schedule_id=schedule_id)) # Stay on page
        
    cursor.execute("""
        SELECT v.Capacity, COUNT(r.Registration_Id) AS participants, s.Event_Id 
        FROM Schedule s JOIN Venue v ON s.Venue_Id = v.Venue_Id LEFT JOIN Registrations r ON s.Schedule_Id = r.Schedule_Id
        WHERE s.Schedule_Id = %s GROUP BY v.Capacity, s.Event_Id
    """, (schedule_id,))
    session_info = cursor.fetchone()

    if session_info and session_info['participants'] < session_info['Capacity']:
        cursor.execute("INSERT INTO Registrations (Attendee_Id, Schedule_Id, Registration_Date) VALUES (%s, %s, CURDATE())", (attendee_id, schedule_id))
        db.commit()
        flash("Registered successfully.", "success") # Shortened message
    elif session_info:
        flash("Session full.", "error") # Shortened message
    else:
        flash("Session not found.", "error")
        
    cursor.close(); db.close()
    
    # FIX: Redirect directly to the session detail page to stay on the same window
    return redirect(url_for('attendee_session_detail', schedule_id=schedule_id))

@app.route('/attendee/leave/<int:schedule_id>', methods=['POST'])
def attendee_leave(schedule_id):
    if 'user_id' not in session or session.get('user_type') != 'attendee':
        flash("You must be logged in as an attendee to leave a session.", "error")
        return redirect(url_for('attendee_login'))

    attendee_id = session['user_id']
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("DELETE FROM Registrations WHERE Schedule_Id = %s AND Attendee_Id = %s", (schedule_id, attendee_id))
    
    if cursor.rowcount > 0:
        db.commit()
        flash("Successfully unregistered from the session.", "info")
    else:
        flash("You were not registered for that session.", "error")
        
    cursor.close(); db.close()
    return redirect(request.referrer or url_for('attendee_dashboard'))


# ---------- Run ---------- #
if __name__ == '__main__':
    app.run(debug=True)