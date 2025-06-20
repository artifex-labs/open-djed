import { type JSX } from 'react'
import FooterIcon from './FooterIcon'
import Tooltip from '../Tooltip'
import { useTranslation } from 'react-i18next'

interface FooterLink {
  label: string
  href: string
  tooltip: string
  lightIcon?: string
  darkIcon?: string
  element?: JSX.Element
}

const Footer = () => {
  const { t } = useTranslation()

  const footerLinks: FooterLink[] = [
    {
      label: t('footer.links.discord'),
      href: 'https://discord.gg/MhYP7w8n8p',
      tooltip: t('footer.tooltips.discord'),
      lightIcon: '/logos/discord-logo.png',
    },
    {
      label: t('footer.links.twitter'),
      href: 'https://x.com/artifex_labs',
      tooltip: t('footer.tooltips.twitter'),
      lightIcon: '/logos/x-dark-logo.svg',
      darkIcon: '/logos/x-logo.svg',
    },
    {
      label: t('footer.links.github'),
      href: 'https://github.com/artifex-labs/open-djed',
      tooltip: t('footer.tooltips.github'),
      lightIcon: '/logos/github-dark.svg',
      darkIcon: '/logos/github-white.svg',
    },
    {
      label: t('footer.links.djed'),
      href: 'https://djed.xyz',
      tooltip: t('tefooterrms.tooltips.djed'),
      lightIcon: '/logos/djed.svg',
    },
    {
      label: t('footer.links.status'),
      href: 'https://status.artifex.finance/',
      tooltip: t('footer.tooltips.status'),
      element: <i className="fas fa-heartbeat text-red-500"></i>,
    },
    {
      label: t('footer.links.terms'),
      href: '/terms',
      tooltip: t('footer.tooltips.terms'),
      element: <i className="fas fa-file-contract text-primary-500"></i>,
    },
    {
      label: t('footer.links.privacy'),
      href: '/privacy',
      tooltip: t('footer.tooltips.privacy'),
      element: <i className="fas fa-user-secret text-primary-500"></i>,
    },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="flex flex-col md:flex-row gap-8 p-8 justify-between bg-light-footer dark:bg-dark-footer border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <img src="/logos/artifex-logo.png" alt={t('footer.logoAlt')} className="w-[50px]" />
        <p className="pt-1">{t('footer.rightsReserved', { year: currentYear })}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {footerLinks.map(({ label, href, tooltip, element, lightIcon, darkIcon }) => (
          <div key={label}>
            <Tooltip
              text={tooltip}
              children={
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="hover:text-primary focus:outline-none transition-colors flex items-center gap-1"
                >
                  <FooterIcon element={element} lightIcon={lightIcon} darkIcon={darkIcon} label={label} />
                  <span>{label}</span>
                </a>
              }
            />
          </div>
        ))}
      </div>
    </footer>
  )
}

export default Footer
