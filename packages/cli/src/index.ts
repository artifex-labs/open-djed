import { Lucid, CML, type UTxO, type Assets, Blockfrost } from '@lucid-evolution/lucid'
import { program } from 'commander'
import { createMintDjedOrder, createBurnShenOrder, cancelOrderByOwner, createBurnDjedOrder, createMintShenOrder, registryByNetwork } from 'txs'
import { MyBlockfrost } from './blockfrost'

const network = 'Preprod'
const blockfrostProjectIdByNetwork = {
  Mainnet: 'mainnet6nn5cOiVycGeknLTOBNbmw1fgTeoQWfo',
  Preprod: 'preprodmAhR2Rq99LM1WGxB9DXVS2WOILme1hZF',
}
const blockfrostProjectId = blockfrostProjectIdByNetwork[network]
console.log(`Initializing Lucid with Blockfrost for network "${network}" using project id "${blockfrostProjectId}".`)
const lucid = await Lucid(new MyBlockfrost(`https://cardano-${network.toLocaleLowerCase()}.blockfrost.io/api/v0`, blockfrostProjectId), network)
console.log('Finished initializing Lucid.')
const registry = registryByNetwork[network]

program
  .command('create-mint-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWallet.fromAddress(address, await lucid.utxosAt(address))
    const tx = await createMintDjedOrder({ lucid, registry, amount: BigInt(amount), address })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await balancedTx.complete()
    console.log(signedTx.toCBOR())
  })

program
  .command('create-burn-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWallet.fromAddress(address, await lucid.utxosAt(address))
    const tx = await createBurnDjedOrder({ lucid, registry, amount: BigInt(amount), address })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await balancedTx.complete()
    console.log(signedTx.toCBOR())
  })

program
  .command('create-mint-shen-order')
  .argument('<address>', 'Address to mint SHEN to')
  .argument('<amount>', 'Amount of SHEN to mint')
  .action(async (address, amount) => {
    lucid.selectWallet.fromAddress(address, await lucid.utxosAt(address))
    const tx = await createMintShenOrder({ lucid, registry, amount: BigInt(amount), address })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await balancedTx.complete()
    console.log(signedTx.toCBOR())
  })

program
  .command('create-burn-shen-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWallet.fromAddress(address, await lucid.utxosAt(address))
    const tx = await createBurnShenOrder({ lucid, registry, amount: BigInt(amount), address })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await balancedTx.complete()
    console.log(signedTx.toCBOR())
  })

program
  .command('create-and-cancel-mint-djed-order')
  .argument('<address>', 'Address to mint DJED to')
  .argument('<amount>', 'Amount of DJED to mint')
  .action(async (address, amount) => {
    lucid.selectWallet.fromAddress(address, await lucid.utxosAt(address))
    const mintDjedOrderTx = await createMintDjedOrder({ lucid, registry, amount: BigInt(amount), address })
    const balancedMintDjedOrderTx = await mintDjedOrderTx.complete({ localUPLCEval: false })
    const cmlTransactionOutputToUTxO = (cmlTransactionOutput: CML.TransactionOutput, txHash: string, outputIndex: number): UTxO => {
      const cmlValueToAssets = (cmlValue: CML.Value): Assets => {
        const cmlArrayLikeToArray = <T>(cmlArrayLike: { get: (i: number) => T, len(): number }): T[] => {
          const len = cmlArrayLike.len()
          const array = []
          for (let i = 0; i < len; i++) {
            array.push(cmlArrayLike.get(i))
          }
          return array
        }
        const assets: Assets = {
          lovelace: BigInt(cmlValue.coin()),
        }
        const multiAsset = cmlValue.multi_asset()
        if (multiAsset) {
          for (const policyId of cmlArrayLikeToArray(multiAsset.keys())) {
            const assetsWithPolicyId = multiAsset.get_assets(policyId)
            if (assetsWithPolicyId) {
              for (const assetName of cmlArrayLikeToArray(assetsWithPolicyId.keys())) {
                const policyIdHex = policyId.to_hex()
                const assetNameHex = assetName.to_hex()
                const amount = multiAsset.get(policyId, assetName) ?? 0n
                if (amount === 0n) {
                  throw new Error('This should never happen.')
                }
                assets[policyIdHex + assetNameHex] = amount
              }
            }
          }
        }
        return assets
      }
      return {
        txHash,
        outputIndex,
        assets: cmlValueToAssets(cmlTransactionOutput.amount()),
        address: cmlTransactionOutput.address().to_bech32(),
        datumHash: cmlTransactionOutput.datum()?.as_hash()?.to_hex(),
        datum: cmlTransactionOutput.datum()?.as_datum()?.to_cbor_hex(),
        scriptRef: undefined,
      }
    }
    const signedMintDjedOrderTx = await balancedMintDjedOrderTx.complete()
    console.log(signedMintDjedOrderTx.toCBOR())
    const orderUtxo = cmlTransactionOutputToUTxO(signedMintDjedOrderTx.toTransaction().body().outputs().get(0), signedMintDjedOrderTx.toHash(), 0)
    const cancelDjedOrderTx = await cancelOrderByOwner({ lucid, network, orderUtxo }).catch(e => { console.error('Couldn\'t cancel order due to error', e); throw e })
    const balancedCancelDjedOrderTx = await cancelDjedOrderTx.complete({ localUPLCEval: false })
    const signedCancelDjedOrderTx = await balancedCancelDjedOrderTx.complete()
    console.log(signedCancelDjedOrderTx.toCBOR())
  })

await program.parseAsync()