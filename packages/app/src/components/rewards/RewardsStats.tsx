"use client"

import { useTranslations } from "next-intl"
import clsx from "clsx"
import BaseCard from "@/components/card/BaseCard"
import { formatNumber } from "@/utils"

type Props = {
  currentEpoch: number | null
  totalDistributed: number | null
  totalPending: number | null
}

const ada = (value: number | null) =>
  value === null ? "-" : `${formatNumber(value)} ADA`

const StatCard = ({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) => (
  <BaseCard className={clsx("gap-6", className)}>
    <span className="text-tertiary text-sm font-medium">{label}</span>
    <span className="text-h3 font-bold">{value}</span>
  </BaseCard>
)

const RewardsStats = ({
  currentEpoch,
  totalDistributed,
  totalPending,
}: Props) => {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={t("rewards.stats.currentEpoch")}
        value={currentEpoch === null ? "-" : String(currentEpoch)}
      />
      <StatCard
        label={t("rewards.stats.totalDistributed")}
        value={ada(totalDistributed)}
      />
      <StatCard
        label={t("rewards.stats.totalPending")}
        value={ada(totalPending)}
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  )
}

export default RewardsStats
