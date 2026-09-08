import type { Type as TagType } from "@/components/Tag"

/** Maps a reward distribution status to the Tag colour it renders with. */
export const STATUS_TAG: Record<string, TagType> = {
  snapshot_taken: "surface",
  to_be_distrusted: "warning",
  distribution_confirmed: "success",
  distributed: "success",
}
