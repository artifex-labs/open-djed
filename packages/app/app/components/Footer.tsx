import React from 'react'
import { NavLink } from 'react-router'

const Footer = () => {
  return (
    <footer className="flex flex-row gap-8 p-8 justify-between bg-white dark:bg-dark-bg border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit">
      <div className="flex flex-row gap-6 items-center">
        <img src="/reverse-djed.svg" alt="Reverse DJED" />
        <p className="pt-1">All rights reserved © 2025</p>
      </div>

      <div className="flex flex-row gap-6 items-center">
        <NavLink
          to="/privacy-policy"
          className={({ isActive }) =>
            isActive ? 'text-primary font-bold' : 'hover:text-primary focus:outline-none transition-colors'
          }
        >
          Privacy Policy
        </NavLink>
        <NavLink
          to="/terms-of-service"
          className={({ isActive }) =>
            isActive ? 'text-primary font-bold' : 'hover:text-primary focus:outline-none transition-colors'
          }
        >
          Terms of Service
        </NavLink>
      </div>
    </footer>
  )
}

export default Footer
