"use client"

import clsx from "clsx"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import ButtonIcon from "@/components/ButtonIcon"
import Tooltip from "@/components/tooltip/Tooltip"
import { CARDANOSCAN_BASE_URL } from "@/lib/constants"
import type { RewardEpoch } from "@/queries/rewards/rewards.schema"

const TxLink = ({ hash, label }: { hash: string; label: string }) => (
  <Tooltip text={label}>
    <Link
      href={`${CARDANOSCAN_BASE_URL}/transaction/${hash}`}
      target="_blank"
      aria-label={label}
    >
      <ButtonIcon size="tiny" variant="outlined" icon="External" />
    </Link>
  </Tooltip>
)

/** Cardanoscan links for an epoch's reward and airdrop transactions. */
const RewardTxLinks = ({
  epoch,
  className,
}: {
  epoch: Pick<RewardEpoch, "rewardTxHash" | "airDropTxHash">
  className?: string
}) => {
  const t = useTranslations()

  if (!epoch.rewardTxHash && !epoch.airDropTxHash) return null

  return (
    <div
      className={clsx("flex items-center gap-8", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {epoch.rewardTxHash && (
        <TxLink hash={epoch.rewardTxHash} label={t("rewards.table.rewardTx")} />
      )}
      {epoch.airDropTxHash && (
        <TxLink
          hash={epoch.airDropTxHash}
          label={t("rewards.table.airdropTx")}
        />
      )}
    </div>
  )
}

export default RewardTxLinks
