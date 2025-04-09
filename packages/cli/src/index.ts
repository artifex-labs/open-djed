import { Lucid, Blockfrost } from '@liqwid-labs/lucid'
import { program } from 'commander'
import { createMintDjedOrder } from '../../txs/src'

const lucid = await Lucid.new(new Blockfrost('https://cardano-mainnet.blockfrost.io/api/v0', 'mainnet6nn5cOiVycGeknLTOBNbmw1fgTeoQWfo'), 'Mainnet')

program
  .command('create-mint-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWalletFrom({ address })
    const tx = await createMintDjedOrder({ lucid, network: 'Mainnet', amount: BigInt(amount), address })
    console.log((await tx.complete()).toString())
  })

await program.parseAsync()