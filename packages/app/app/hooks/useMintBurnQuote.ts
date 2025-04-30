import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '~/context/ApiClientContext'
import type { ActionType } from '~/types/action'
import type { TokenType } from '~/types/token'

export function useMintBurnQuote({
  action,
  token,
  amount,
}: {
  action: ActionType
  token: TokenType
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
