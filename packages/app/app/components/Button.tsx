import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ref?: React.Ref<HTMLButtonElement> | undefined
  disabled?: boolean
  dark?: boolean
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, ref, disabled, dark, size='md' }) => {
  
  const sizeClass = {
    sm: "w-24",
    md: "w-32",
    lg: "w-40",
  }[size];
  
  return (
    <button
      className={`${sizeClass} bg-purple-600 text-white ${disabled ? 'bg-gray-500 text-secondary cursor-not-allowed' : ''}  hover:opacity-40 transition-opacity px-4 py-2 rounded-lg cursor-pointer ${className} `}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
