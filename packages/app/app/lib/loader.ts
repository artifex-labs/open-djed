import type { LoaderFunctionArgs } from 'react-router'
import type { Route } from '../+types/root'
import type { LoaderData } from '~/types/loader'
import { parse } from 'cookie';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function loader({ context, request }: LoaderFunctionArgs): LoaderData & { initialIsDark: 'dark' | 'light' | null } {
  const { API_URL, NETWORK, CONFIG } = context.cloudflare.env;
  if (!API_URL || !NETWORK) throw new Error('Missing env vars');

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = parse(cookieHeader);

  const initialIsDark =
    cookies.theme === 'dark'  ? 'dark'
  : cookies.theme === 'light' ? 'light'
  : null;

  return {
    apiUrl: API_URL,
    network: NETWORK,
    config: JSON.parse(CONFIG),
    initialIsDark,
  };
}
