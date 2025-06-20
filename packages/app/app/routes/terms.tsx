import { useLoaderData } from 'react-router'
import type { LoaderData } from '~/types/loader'
import { useTranslation } from 'react-i18next'

export function meta() {
  const { network } = useLoaderData<LoaderData>()
  return [
    { title: 'Open DJED | Terms of Service' },
    { name: 'description', content: 'Review the terms of using Open DJED.' },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://${network === 'Preprod' ? 'preprod.' : ''}djed.artifex.finance/terms`,
    },
  ]
}

export default function TermsPage() {
  const { t } = useTranslation()

  const month = t('months.may')
  const day = 15
  const year = 2025
  const effectiveDate = `${month} ${day}, ${year}`

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full p-8">
      <div className="flex flex-col text-center">
        <h1 className="text-4xl font-bold">{t('terms.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('terms.effectiveDate', { date: effectiveDate })}
        </p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-6 text-base leading-relaxed">
        <p>{t('terms.welcome')}</p>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.description.title')}</h2>
          <p>{t('terms.sections.description.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.use.title')}</h2>
          <p>{t('terms.sections.use.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.license.title')}</h2>
          <p>
            {t('terms.sections.license.part1')}{' '}
            <a
              href="https://www.gnu.org/licenses/gpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              {t('terms.sections.license.linkText')}
            </a>
            .
          </p>
          <p>{t('terms.sections.license.part2')}</p>
          <p>
            {t('terms.sections.license.part3')}{' '}
            <a
              href="https://github.com/artifex-labs/open-djed"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              github.com/artifex-labs/open-djed
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.wallet.title')}</h2>
          <p>{t('terms.sections.wallet.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.disclaimers.title')}</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('terms.sections.disclaimers.item1')}</li>
            <li>{t('terms.sections.disclaimers.item2')}</li>
            <li>{t('terms.sections.disclaimers.item3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.changes.title')}</h2>
          <p>{t('terms.sections.changes.content')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">{t('terms.sections.contact.title')}</h2>
          <p>
            {t('terms.sections.contact.content')}{' '}
            <a
              href="https://discord.gg/MhYP7w8n8p"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Discord
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
