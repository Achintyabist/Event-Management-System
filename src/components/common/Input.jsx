import React from 'react';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

export default Input;
