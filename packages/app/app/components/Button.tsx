import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ref?: React.Ref<HTMLButtonElement> | undefined
  disabled?: boolean
  dark?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, ref, disabled }) => {
  return (
    <button
      className={`border-1 border-black rounded-md p-2 font-bold ${disabled ? 'bg-gray-500 text-secondary cursor-not-allowed' : ''}  hover:bg-gray-100 transition-opacity px-4 py-2 rounded-lg cursor-pointer ${className} `}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
