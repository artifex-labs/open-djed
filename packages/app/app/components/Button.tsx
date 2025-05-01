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
      className={`rounded-md p-2 text-white font-bold ${disabled ? 'bg-light-disabled dark:bg-dark-disabled opacity-50 cursor-not-allowed' : 'bg-primary'}  hover:bg-primary-hover transition-opacity px-4 py-2 rounded-lg cursor-pointer ${className} `}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
    >
      {children}
    </button>
  )
}

export default Button
