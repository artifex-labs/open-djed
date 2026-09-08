"use client"

import * as React from "react"
import clsx from "clsx"

export type RewardRowData = {
  key: string
  columns: { content: React.ReactNode }[]
}

const RewardRow: React.FC<{ row: RewardRowData; hasBorder?: boolean }> = ({
  row,
  hasBorder,
}) => (
  <tr
    className={clsx("text-primary hover:bg-background-primary-hover text-xs", {
      "border-border-primary border-b": hasBorder,
    })}
  >
    {row.columns.map((column, index) => (
      <td key={index}>{column.content}</td>
    ))}
  </tr>
)

export default RewardRow
