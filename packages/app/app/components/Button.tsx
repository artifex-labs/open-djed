import React from 'react'

type ButtonProps = {
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
      className={`text-white font-bold bg-primary ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary-hover cursor-pointer'} transition-opacity px-4 py-2 rounded-lg ${className} `}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
