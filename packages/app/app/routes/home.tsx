import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Reverse DJED" },
    { name: "description", content: "Welcome to reverse DJED!" },
  ]
}

export function loader() {
  return {}
}

const TokenDetails = ({ token }: { token: 'DJED' | 'SHEN' }) => {
  return (
    <div className="flex-column border-2 border-black rounded-md p-4 m-4 w-full">
      <span className="font-black">{token}</span><br />
      <div className="flex justify-between"><span>Buy price</span><span>0 ADA</span></div>
      <div className="flex justify-between"><span>Sell price</span><span>0 ADA</span></div>
      <div className="flex justify-between"><span>Circulating supply</span><span>0 DJED</span></div>
      <div className="flex justify-between"><span>Mintable amount</span><span>0 DJED</span></div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-1/2 flex-column border-2 border-black rounded-md p-4 m-4">
        <div className="flex flex-row items-center justify-center">
          <TokenDetails token="DJED" />
          <TokenDetails token="SHEN" />
        </div>
        <div className="flex-column border-2 border-black rounded-md p-4 m-4">
          <span className="font-black">Reserve</span><br />
          <div className="flex justify-between"><span>Ratio</span><span>457%</span></div>
          <div className="flex justify-between"><span>Value</span><span>0 ADA</span></div>
        </div>
      </div>
    </div>
  )
}
