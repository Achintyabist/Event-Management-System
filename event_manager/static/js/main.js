// main.js - front-end logic for Event Manager
// Expects Flask endpoints (adjust names if needed):
// POST   /api/signup         { role, name, email, phone, password }
// POST   /api/login          { role, email, password }
// GET    /api/events         -> list of events (for attendees)
// GET    /api/organizer/events -> events for logged-in organizer
// GET    /api/events/:id     -> details (participants_count, venue, seats_left, schedule...)
// POST   /api/events/:id/register   -> register attendee
// POST   /api/events/:id/unregister -> leave event

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  // attempt to load public events (some backends return empty if not logged in)
  fetchAndRenderEvents();
  
  // Setup card click handling for non-inline JS navigation
  setupCardClicks('.js-session-card');
  setupCardClicks('.js-event-card'); 
  setupCardClicks('.js-registered-card'); // Added for dashboard registration cards
});

function initAuthUI(){
  // toggle sign-up / login panels if they exist
  const toggles = document.querySelectorAll('.auth-toggle');
  toggles.forEach(btn => btn.addEventListener('click', (e)=>{
    const role = e.target.dataset.role; // 'organizer' or 'attendee'
    openAuthPanel(role);
  }));

  const signupForms = document.querySelectorAll('.signup-form');
  signupForms.forEach(form=>{
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      await handleSignup(form);
    });
  });

  const loginForms = document.querySelectorAll('.login-form');
  loginForms.forEach(form=>{
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      await handleLogin(form);
    });
  });
}

async function handleSignup(form){
  const role = form.dataset.role;
  const formData = new FormData(form);
  const payload = {
    role,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password')
  };

  try{
    const res = await fetch('/api/signup', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    const j = await res.json();
    if(!res.ok) throw new Error(j.message || 'Signup failed');
    showToast('Signed up successfully — logged in');
    // after signup, render role-specific view:
    afterLogin(role);
  }catch(err){
    showToast(err.message || 'Server error', true);
  }
}

async function handleLogin(form){
  const role = form.dataset.role;
  const formData = new FormData(form);
  const payload = {
    role,
    email: formData.get('email'),
    password: formData.get('password')
  };
  try{
    const res = await fetch('/api/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    const j = await res.json();
    if(!res.ok) throw new Error(j.message || 'Login failed');
    showToast('Welcome back!');
    afterLogin(role);
  }catch(err){
    showToast(err.message || 'Server error', true);
  }
}

function afterLogin(role){
  // If organizer, load organizer events. If attendee, load all events.
  if(role === 'organizer'){
    fetchAndRenderEvents({organizer:true});
  } else {
    fetchAndRenderEvents();
  }
}

/* -------- Events listing & details -------- */

async function fetchAndRenderEvents(opts = {}){
  // opts.organizer true -> call organizer events endpoint
  const url = opts.organizer ? '/api/organizer/events' : '/api/events';
  try{
    const res = await fetch(url, {credentials:'include'});
    if(res.status === 401){
      // not logged in; show public events (guest)
      // optionally show auth prompts
    }
    const data = await res.json();
    renderEvents(data.events || data);
  }catch(err){
    console.error(err);
    showToast('Could not load events', true);
  }
}

function renderEvents(events){
  const grid = document.querySelector('.events-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!events || events.length === 0){
    grid.innerHTML = `<div class="panel center muted">No events yet. Sign in as organizer to create one.</div>`;
    return;
  }

  events.forEach(ev=>{
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.id = ev.Event_Id || ev.event_id || ev.id;
    card.innerHTML = `
      <h3>${escapeHtml(ev.Event_Name || ev.name)}</h3>
      <p>${escapeHtml((ev.Event_Description || ev.description || '').slice(0,140))}...</p>
      <div class="event-meta">
        <span>${ev.Session_Date ? formatDate(ev.Session_Date) : ''}</span>
        <span>${ev.Organizer_Name || ev.organizer_name || ''}</span>
      </div>
    `;
    card.addEventListener('click', ()=> openEventModal(card.dataset.id));
    grid.appendChild(card);
  });
}

async function openEventModal(id){
  try{
    const res = await fetch(`/api/events/${id}`, {credentials:'include'});
    if(!res.ok) throw new Error('Failed to load event details');
    const ev = await res.json();
    // some APIs might return {event: {...}} — support both
    const event = ev.event || ev;
    showEventModal(event);
  }catch(err){
    console.error(err);
    showToast('Could not load event details', true);
  }
}

function showEventModal(event){
  // create modal html
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.style.display = 'flex';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <button class="close-x" aria-label="Close">✕</button>
    <h2>${escapeHtml(event.Event_Name || event.name)}</h2>
    <p class="muted">${escapeHtml(event.Event_Description || event.description || '')}</p>
    <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
      <div><strong>Venue:</strong> ${escapeHtml(event.venue_name || event.Venue || event.venue || 'N/A')}</div>
      <div><strong>Participants:</strong> ${event.participants_count ?? event.participants ?? '—'}</div>
      <div><strong>Seats left:</strong> ${event.seats_left ?? event.seats_left_remaining ?? '—'}</div>
      <div><strong>Organizer:</strong> ${escapeHtml(event.organizer_name || event.Organizer_Name || '')}</div>
    </div>
    <div style="margin-top:12px">${renderSchedule(event.schedule)}</div>
    <div style="margin-top:18px;display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-success" id="register-btn">Register</button>
      <button class="btn btn-danger" id="leave-btn">Leave</button>
    </div>
  `;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // close handling
  modal.querySelector('.close-x').addEventListener('click', ()=> {
    backdrop.remove();
  });
  backdrop.addEventListener('click', (ev)=>{ if(ev.target === backdrop) backdrop.remove() });

  // register/leave actions
  modal.querySelector('#register-btn').addEventListener('click', async ()=>{
    try{
      const res = await fetch(`/api/events/${event.Event_Id || event.id}/register`, {
        method:'POST', credentials:'include'
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.message || 'Could not register');
      showToast('Registered successfully');
      backdrop.remove();
      fetchAndRenderEvents(); // refresh counts
    }catch(err){
      showToast(err.message, true);
    }
  });

  modal.querySelector('#leave-btn').addEventListener('click', async ()=>{
    try{
      const res = await fetch(`/api/events/${event.Event_Id || event.id}/unregister`, {
        method:'POST', credentials:'include'
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.message || 'Could not leave event');
      showToast('Left event');
      backdrop.remove();
      fetchAndRenderEvents();
    }catch(err){
      showToast(err.message, true);
    }
  });
}

function renderSchedule(schedule){
  if(!schedule || schedule.length === 0) return '';
  const rows = schedule.map(s=>{
    const d = s.Session_Date || s.session_date || '';
    const time = (s.Start_Time && s.End_Time) ? `${s.Start_Time} - ${s.End_Time}` : '';
    return `<div style="padding:8px 0;border-bottom:1px dashed #eee">
      <strong>${escapeHtml(s.Session_Name || s.session_name)}</strong><br>
      <span class="muted">${formatDate(d)} ${time} — ${escapeHtml(s.Session_Organizer || s.session_organizer || '')}</span>
    </div>`;
  }).join('');
  return `<h4 style="margin-top:10px">Schedule</h4>${rows}`;
}

/* ---------- Utilities ---------- */

function showToast(msg, isError=false){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div'); t.className='toast'; document.body.appendChild(t);
  }
  t.style.display='block';
  t.textContent = msg;
  t.style.background = isError ? '#b91c1c' : '#111827';
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.display='none' }, 3500);
}

function formatDate(d){
  if(!d) return '';
  // simple ISO to readable. If already readable, just return.
  const dt = new Date(d);
  if(isNaN(dt)) return d; // if server returns readable text
  return dt.toLocaleDateString();
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s=> ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s]);
}

// Function to set up click handlers for non-inline JS navigation
function setupCardClicks(selector) {
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent navigation if clicking on interactive elements (e.g., buttons, anchors)
            if (e.target.closest('a') || e.target.closest('button')) {
                return; 
            }
            
            // Prioritize data-detail-url for clarity, fall back to data-url
            const url = card.getAttribute('data-detail-url') || card.getAttribute('data-url');
            if (url) {
                window.location.href = url;
            }
        });
    });
}