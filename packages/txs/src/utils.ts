import { Lucid } from "@liqwid-labs/lucid";

export const lucidUtilsByNetwork = {
  Mainnet: (await Lucid.new(undefined, 'Mainnet')).utils
}