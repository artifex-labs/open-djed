import { useState } from 'react'
import { Action } from './Action'
import Button from '~/components/Button'

interface ActionsProps {
  token: 'DJED' | 'SHEN'
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
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-3/4 flex flex-col space-y-4">
        <div className="text-center text-xl font-bold mb-4">
          <span>{token} Actions</span>
        </div>
        
        <div className="flex space-x-4 justify-center">
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
        {isActionPending && (
          <div className="mt-4 text-center text-lg">Processing action...</div>
        )}
      </div>
    </div>
  )
}
