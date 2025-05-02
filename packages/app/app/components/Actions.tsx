import { useState } from 'react'
import { Action } from './Action'
import type { TokenType } from '~/types/token'

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
      <div className="flex flex-col gap-10">
        <div className="text-center text-xl font-bold mb-4">
          <span className="text-5xl">{token}</span>
          <span>Actions</span>
        </div>

        <div className="w-full flex flex-row space-x-4 justify-center items-center gap-10">
          <Action
            action="mint"
            token={token}
            onActionStart={handleActionStart}
            onActionComplete={handleActionComplete}
          />
          <Action
            action="burn"
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
