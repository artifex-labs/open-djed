import { createContext, useContext } from 'react'
import { useLoaderData } from 'react-router'
import type { LoaderData } from '../types/loader'

export const EnvContext = createContext<LoaderData | null>(null)

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>()
  console.log(data)
  return <EnvContext.Provider value={data}>{children}</EnvContext.Provider>
}

export function useEnv() {
  const ctx = useContext(EnvContext)
  if (!ctx) throw new Error('EnvContext not found')
  return ctx
}
