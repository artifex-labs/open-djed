import { useState } from 'react'
import { Action } from './Action'
import type { TokenType } from '@reverse-djed/api'

type ActionsProps = {
  token: TokenType
}

export const Actions = ({ token }: ActionsProps) => {
  const [isActionPending, setIsActionPending] = useState(false)

  const handleActionStart = () => {
    setIsActionPending(true)
  }

  const handleActionComplete = () => {
    setIsActionPending(false)
  }

  return (
    <div className="w-full flex flex-col justify-center items-center py-8">
      <div className="flex flex-col gap-6 max-w-screen-md w-full px-4">
        <div className="text-center text-xl font-bold mb-4 flex flex-col items-center">
          <span className="text-5xl">{token}</span>
          <span>Actions</span>
        </div>

        <div className="w-full flex flex-col sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 gap-4">
          <Action
            action="Mint"
            token={token}
            onActionStart={handleActionStart}
            onActionComplete={handleActionComplete}
          />
          <Action
            action="Burn"
            token={token}
            onActionStart={handleActionStart}
            onActionComplete={handleActionComplete}
          />
        </div>

        {/* Loading state or other statuses */}
        {isActionPending && <div className="mt-4 text-center text-lg">Processing action...</div>}
      </div>
    </div>
  )
}
