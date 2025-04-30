import React, { type ReactNode } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 px-2"
      onClick={onClose}
    >
      <div
        className="rounded-lg border-2 p-4 max-w-full max-h-full sm:max-w-[800px] sm:max-h-[85vh] overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-300 pb-2 mb-4 sticky top-0 z-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-secondary">{title}</h2>
          <button onClick={onClose} className="text-2xl font-semibold text-secondary transition">
            &times;
          </button>
        </div>

        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal
