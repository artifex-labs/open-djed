// hooks/useMintBurnQuote.ts
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '~/context/ApiClientContext'

export function useMintBurnQuote({
  action,
  token,
  amount,
}: {
  action: 'mint' | 'burn'
  token: 'DJED' | 'SHEN'
  amount: number
}) {
  const client = useApiClient()

  return useQuery({
    queryKey: [token, action, amount, 'quote'],
    queryFn: () =>
      client.api[':token'][':action'][':amount']['data']
        .$get({ param: { token, action, amount: amount.toString() } })
        .then((r) => r.json()),
  })
}
