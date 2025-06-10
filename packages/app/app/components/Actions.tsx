import { useState } from 'react'
import { Action } from './Action'
import type { TokenType } from '@reverse-djed/api'

type ActionsProps = {
  token: TokenType
}

const ACTIONS = ['Mint', 'Burn'] as const

export const Actions = ({ token }: ActionsProps) => {
  const [isActionPending, setIsActionPending] = useState(false)

  const handleActionStart = () => {
    setIsActionPending(true)
  }

  const handleActionComplete = () => {
    setIsActionPending(false)
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="flex flex-col gap-6 w-full px-4">
        <div className="text-center text-xl font-bold mb-4 flex flex-col items-center">
          <span className="text-5xl">{token}</span>
          <span>Actions</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full max-w-screen-lg mx-auto">
          {ACTIONS.map((action) => (
            <div key={action} className="w-full md:flex-1">
              <Action
                key={action}
                action={action}
                token={token}
                onActionStart={handleActionStart}
                onActionComplete={handleActionComplete}
              />
            </div>
          ))}
        </div>

        {/* Loading state or other statuses */}
        {isActionPending && <div className="mt-4 text-center text-lg">Processing action...</div>}
      </div>
    </div>
  )
}
