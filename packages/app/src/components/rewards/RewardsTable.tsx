"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Table, { type HeaderItem } from "@/components/table/Table"
import Tag, { type Type as TagType } from "@/components/Tag"
import ButtonIcon from "@/components/ButtonIcon"
import BaseCard from "@/components/card/BaseCard"
import { Skeleton } from "@/components/Skeleton"
import { formatNumber } from "@/utils"
import { formatDateLabel } from "@/utils/date"
import {
  CARDANOSCAN_BASE_URL,
  REWARD_DISTRIBUTION_THRESHOLD_ADA,
} from "@/lib/constants"
import {
  isKnownDistributionStatus,
  type RewardEpoch,
} from "@/queries/rewards/rewards.schema"
import RewardRow, { type RewardRowData } from "./RewardRow"

type Props = {
  epochs: RewardEpoch[]
  loading: boolean
  totalCount: number
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  rowsPerPage: number
}

const STATUS_TAG: Record<string, TagType> = {
  snapshot_taken: "surface",
  to_be_distrusted: "warning",
  distribution_confirmed: "success",
  distributed: "success",
}

const HEADER_KEYS = ["epoch", "amount", "reward", "status", "date"] as const
const COLUMN_COUNT = HEADER_KEYS.length + 1 // + the actions column

const RewardsTable = ({
  epochs,
  loading,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  rowsPerPage,
}: Props) => {
  const t = useTranslations()

  const headers: HeaderItem[] = useMemo(
    () => [
      ...HEADER_KEYS.map((key) => ({
        column: t(`rewards.table.header.${key}`),
        columnKey: key,
        size: "full" as const,
      })),
      { column: undefined, columnKey: "actions", size: "small" as const },
    ],
    [t],
  )

  const dataRows: RewardRowData[] = useMemo(
    () =>
      epochs.map((e) => {
        const statusLabel = isKnownDistributionStatus(e.distributionStatus)
          ? t(`rewards.status.${e.distributionStatus}`)
          : e.distributionStatus

        return {
          key: String(e.epochNumber),
          columns: [
            { content: <div className="px-16 py-12">{e.epochNumber}</div> },
            {
              content: (
                <div className="px-16 py-12 text-nowrap">
                  {formatNumber(e.shenAmount)} SHEN
                </div>
              ),
            },
            {
              content: (
                <div className="px-16 py-12 text-nowrap">
                  {formatNumber(e.rewardAmount)} ₳
                </div>
              ),
            },
            {
              content: (
                <div className="px-16 py-12">
                  <Tag
                    type={STATUS_TAG[e.distributionStatus] ?? "surface"}
                    role="Secondary"
                    size="small"
                    text={statusLabel}
                  />
                </div>
              ),
            },
            {
              content: (
                <div className="px-16 py-12 text-nowrap">
                  {formatDateLabel(e.epochEndTime) ?? "-"}
                </div>
              ),
            },
            {
              content: (
                <div className="flex justify-end px-16 py-12">
                  {e.rewardTxHash && (
                    <Link
                      href={`${CARDANOSCAN_BASE_URL}/transaction/${e.rewardTxHash}`}
                      target="_blank"
                    >
                      <ButtonIcon
                        size="small"
                        variant="outlined"
                        icon="External"
                      />
                    </Link>
                  )}
                </div>
              ),
            },
          ],
        }
      }),
    [epochs, t],
  )

  const skeletonRowCount =
    totalCount > 0
      ? Math.min(rowsPerPage, totalCount - (currentPage - 1) * rowsPerPage)
      : rowsPerPage

  const skeletonRows: RewardRowData[] = useMemo(
    () =>
      Array.from({ length: Math.max(skeletonRowCount, 1) }).map((_, r) => ({
        key: `skeleton-${r}`,
        columns: Array.from({ length: COLUMN_COUNT }).map(() => ({
          content: (
            <div className="px-16 py-12">
              <Skeleton width="w-full" height="h-[18px]" />
            </div>
          ),
        })),
      })),
    [skeletonRowCount],
  )

  if (!loading && epochs.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-12">
        <h2 className="text-lg font-semibold">{t("rewards.table.title")}</h2>
        <BaseCard
          border="border-gradient border-color-primary"
          className="justify-center p-16"
        >
          <div className="flex flex-col items-center justify-center gap-24 text-center">
            <p className="text-lg font-semibold">{t("rewards.noData")}</p>
          </div>
        </BaseCard>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-12">
      <h2 className="text-lg font-semibold">{t("rewards.table.title")}</h2>

      <Table
        headers={headers}
        rows={loading ? skeletonRows : dataRows}
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
        serverSidePagination
        fixedLayout
        RowComponent={RewardRow}
      />

      <p className="text-tertiary text-xs">
        {t("rewards.rewardThresholdNote", {
          threshold: REWARD_DISTRIBUTION_THRESHOLD_ADA,
        })}
      </p>
    </div>
  )
}

export default RewardsTable
