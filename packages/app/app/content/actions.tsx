import { useState } from "react"

const Action = ({ type, token }: { type: 'Mint' | 'Burn', token: 'DJED' | 'SHEN' }) => {
  const [amount, setAmount] = useState(0)
  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <span className="font-black">{type}</span><br />
      <div className="flex justify-between"><span>Cost</span><span>0 ADA</span></div>
      <div className="flex justify-between"><span>Fees</span><span>0 ADA</span></div>
      <div className="flex justify-between"><span>You will pay</span><span>0 ADA</span></div>
      <div className="flex justify-between"><span>Minimum ADA requirement</span><span>0 ADA</span></div>
      <input className="border-1 border-black w-full my-4" type="number" value={amount} onChange={i => setAmount(Number(i.target.value))}></input><br />
      <button className="border-1 border-black rounded-md p-2 w-full">{`Mint ${amount} ${token}`}</button>
    </div>
  )
}

export const Actions = ({ token }: { token: 'DJED' | 'SHEN' }) => {
  return (
    <div className="w-full flex flex-row justify-center items-center">
      <div className="w-1/2 flex flex-row justify-center items-center">
        <Action type="Mint" token={token} />
        <Action type="Burn" token={token} />
      </div>
    </div>
  )
}