import { useState } from "react"

const DJED = () => {
  const [mintAmount, setMintAmount] = useState(0)
  const [burnAmount, setBurnAmount] = useState(0)
  return (
    <div className="h-screen w-full flex flex-row justify-center items-center">
      <div className="flex-column border-2 border-black rounded-md p-4 m-4">
        <span>Mint</span><br />
        <input className="border-1 border-black w-30 mb-2" type="number" value={mintAmount} onChange={i => setMintAmount(Number(i.target.value))}></input><br />
        <button className="border-1 border-black rounded-md p-2 w-30">{`Mint ${mintAmount} DJED`}</button>
      </div>
      <div className="flex-column border-2 border-black rounded-md p-4 m-4">
        <span>Burn</span><br />
        <input className="border-1 border-black w-30 mb-2" type="number" value={burnAmount} onChange={i => setBurnAmount(Number(i.target.value))}></input><br />
        <button className="border-1 border-black rounded-md p-2 w-30">{`Burn ${burnAmount} DJED`}</button>
      </div>
    </div>
  )
}

export default DJED