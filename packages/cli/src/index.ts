import { Lucid, Blockfrost, C, type UTxO, type Assets, toHex } from '@liqwid-labs/lucid'
import { program } from 'commander'
import { createMintDjedOrder, cancelOrderByOwner } from 'txs'

const lucid = await Lucid.new(new Blockfrost('https://cardano-mainnet.blockfrost.io/api/v0', 'mainnet6nn5cOiVycGeknLTOBNbmw1fgTeoQWfo'), 'Mainnet')

program
  .command('create-mint-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWalletFrom({ address })
    const tx = await createMintDjedOrder({ lucid, network: 'Mainnet', amount: BigInt(amount), address })
    const balancedTx = await tx.complete()
    const signedTx = await balancedTx.complete()
    console.log(signedTx.toString())
  })

program
  .command('create-and-cancel-mint-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWalletFrom({ address })
    const mintDjedOrderTx = await createMintDjedOrder({ lucid, network: 'Mainnet', amount: BigInt(amount), address })
    const balancedMintDjedOrderTx = await mintDjedOrderTx.complete()
    const cmlTransactionOutputToUTxO = (cmlTransactionOutput: C.TransactionOutput, txHash: string, outputIndex: number): UTxO => {
      const cmlValueToAssets = (cmlValue: C.Value): Assets => {
        const cmlArrayLikeToArray = <T>(cmlArrayLike: { get: (i: number) => T, len(): number }): T[] => {
          const len = cmlArrayLike.len()
          const array = []
          for (let i = 0; i < len; i++) {
            array.push(cmlArrayLike.get(i))
          }
          return array
        }
        const assets: Assets = {
          lovelace: BigInt(cmlValue.coin().to_str()),
        }
        const multiAsset = cmlValue.multiasset()
        if (multiAsset) {
          for (const policyId of cmlArrayLikeToArray(multiAsset.keys())) {
            for (const assetName of cmlArrayLikeToArray(multiAsset.get(policyId)?.keys() ?? { get: () => { throw new Error('This should never happen.') }, len: () => 0 })) {
              const policyIdHex = policyId.to_hex()
              const assetNameHex = toHex(assetName.to_bytes())
              const amount = BigInt(multiAsset.get_asset(policyId, assetName).to_str())
              if (amount === 0n) {
                throw new Error('This should never happen.')
              }
              assets[policyIdHex + assetNameHex] = amount
            }
          }
        }
        return assets
      }
      const inlineDatum = cmlTransactionOutput.datum()?.to_bytes()
      return {
        txHash,
        outputIndex,
        assets: cmlValueToAssets(cmlTransactionOutput.amount()),
        address: cmlTransactionOutput.address().to_bech32('addr1'),
        datumHash: cmlTransactionOutput.datum()?.as_data_hash()?.to_hex(),
        datum: inlineDatum ? toHex(inlineDatum) : inlineDatum,
        scriptRef: undefined,
      }
    }
    const orderUtxo = cmlTransactionOutputToUTxO(balancedMintDjedOrderTx.txComplete.body().outputs().get(0), balancedMintDjedOrderTx.toHash(), 0)
    const signedMintDjedOrderTx = await balancedMintDjedOrderTx.complete()
    console.log(signedMintDjedOrderTx.toString())
    const cancelDjedOrderTx = await cancelOrderByOwner({ lucid, network: 'Mainnet', orderUtxo }).catch(e => { console.error('Couldn\'t cancel order due to error', e); throw e })
    const balancedCancelDjedOrderTx = await cancelDjedOrderTx.complete()
    const signedCancelDjedOrderTx = await balancedCancelDjedOrderTx.complete()
    console.log(signedCancelDjedOrderTx.toString())
  })

await program.parseAsync()