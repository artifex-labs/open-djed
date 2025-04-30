import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '~/context/ApiClientContext'


export function useProtocolData() {
  const client = useApiClient()
  return useQuery({
    queryKey: ['protocol-data'],
    queryFn: () => client.api['protocol-data'].$get().then((r) => r.json()),
  })
}
