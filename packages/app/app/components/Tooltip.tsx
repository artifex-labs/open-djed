interface TooltipProps {
  text: string
  tooltipDirection?: 'top' | 'bottom' | 'left' | 'right'
  children?: React.ReactNode
}

const Tooltip = ({ text, tooltipDirection = 'top', children }: TooltipProps) => {
  const tooltipClass = `tooltip tooltip-${tooltipDirection}`

  return (
    <div className={tooltipClass}>
      <div className="tooltip-content">
        <div className="bg-white dark:bg-black rounded-lg p-2 opacity-95">{text}</div>
      </div>
      {children ? <div className="cursor-help">{children}</div> : <i className="fa-solid fa-circle-info"></i>}
    </div>
  )
}
export default Tooltip
