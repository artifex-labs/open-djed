import { Lucid } from '@lucid-evolution/lucid'
import { program } from 'commander'
import { createMintDjedOrder, createBurnShenOrder, createBurnDjedOrder, createMintShenOrder, registryByNetwork, cancelOrderByOwner } from 'txs'
import { MyBlockfrost } from './blockfrost'
import { env } from './env'
import { parseOutRef } from './utils'

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

if (env.SEED) {
  lucid.selectWallet.fromSeed(env.SEED)
} else if (env.ADDRESS) {
  lucid.selectWallet.fromAddress(env.ADDRESS, await lucid.utxosAt(env.ADDRESS))
}

program
  .command('create-mint-djed-order')
  .argument('<amount>', 'Amount of DJED to mint')
  .option('--sign', 'Sign the transaction')
  .option('--submit', 'Submit the transaction')
  .action(async (amount, options) => {
    const tx = await createMintDjedOrder({ lucid, registry, amount: BigInt(amount), address: await lucid.wallet().address() })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (options.sign ? balancedTx.sign.withWallet() : balancedTx).complete()
    console.log('Transaction CBOR')
    console.log(signedTx.toCBOR())
    console.log('Transaction hash')
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log('Transaction submitted')
    }
  })

program
  .command('create-burn-djed-order')
  .argument('<amount>', 'Amount of DJED to mint')
  .option('--sign', 'Sign the transaction')
  .option('--submit', 'Submit the transaction')
  .action(async (amount, options) => {
    const tx = await createBurnDjedOrder({ lucid, registry, amount: BigInt(amount), address: await lucid.wallet().address() })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (options.sign ? balancedTx.sign.withWallet() : balancedTx).complete()
    console.log('Transaction CBOR')
    console.log(signedTx.toCBOR())
    console.log('Transaction hash')
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log('Transaction submitted')
    }
  })

program
  .command('create-mint-shen-order')
  .argument('<amount>', 'Amount of SHEN to mint')
  .option('--sign', 'Sign the transaction')
  .option('--submit', 'Submit the transaction')
  .action(async (amount, options) => {
    const tx = await createMintShenOrder({ lucid, registry, amount: BigInt(amount), address: await lucid.wallet().address() })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (options.sign ? balancedTx.sign.withWallet() : balancedTx).complete()
    console.log('Transaction CBOR')
    console.log(signedTx.toCBOR())
    console.log('Transaction hash')
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log('Transaction submitted')
    }
  })

program
  .command('create-burn-shen-order')
  .argument('<amount>', 'Amount of DJED to mint')
  .option('--sign', 'Sign the transaction')
  .option('--submit', 'Submit the transaction')
  .action(async (amount, options) => {
    const tx = await createBurnShenOrder({ lucid, registry, amount: BigInt(amount), address: await lucid.wallet().address() })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (options.sign ? balancedTx.sign.withWallet() : balancedTx).complete()
    console.log('Transaction CBOR')
    console.log(signedTx.toCBOR())
    console.log('Transaction hash')
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log('Transaction submitted')
    }
  })

program
  .command('cancel-order')
  .argument('<out-ref>', 'The output reference of the order')
  .option('--sign', 'Sign the transaction')
  .option('--submit', 'Submit the transaction')
  .action(async (outRef, options) => {
    const orderUtxo = (await lucid.utxosByOutRef([parseOutRef(outRef)]))[0]
    if (!orderUtxo) throw new Error(`Couldn't find order utxo for outRef: ${outRef}`)
    if (!Object.keys(orderUtxo.assets).includes(registry.orderAssetId)) throw new Error(`Utxo for outRef ${outRef} isn't order utxo.`)
    const tx = await cancelOrderByOwner({ network, lucid, registry, orderUtxo })
    const balancedTx = await tx.complete({ localUPLCEval: false })
    const signedTx = await (options.sign ? balancedTx.sign.withWallet() : balancedTx).complete()
    console.log('Transaction CBOR')
    console.log(signedTx.toCBOR())
    console.log('Transaction hash')
    console.log(signedTx.toHash())
    if (options.submit) {
      await signedTx.submit()
      console.log('Transaction submitted')
    }
  })

await program.parseAsync()