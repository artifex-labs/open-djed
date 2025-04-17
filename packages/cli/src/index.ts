import { Data, Lucid } from '@lucid-evolution/lucid'
import { program } from 'commander'
import { createMintDjedOrder, createBurnShenOrder, createBurnDjedOrder, createMintShenOrder, registryByNetwork, cancelOrderByOwner } from '@reverse-djed/txs'
import { MyBlockfrost } from './blockfrost'
import { env } from './env'
import { parseOutRef } from './utils'
import { OracleDatum, PoolDatum } from '@reverse-djed/data'
import { djedADABurnRate, djedADAMintRate, maxBurnableSHEN, maxMintableDJED, maxMintableSHEN, reserveRatio, shenADABurnRate, shenADAMintRate } from '@reverse-djed/math'

const blockfrostProjectIdByNetwork = {
  Mainnet: 'mainnet6nn5cOiVycGeknLTOBNbmw1fgTeoQWfo',
  Preprod: 'preprodmAhR2Rq99LM1WGxB9DXVS2WOILme1hZF',
}
const blockfrostProjectId = blockfrostProjectIdByNetwork[env.NETWORK]
console.log(`Initializing Lucid with Blockfrost for network "${env.NETWORK}" using project id "${blockfrostProjectId}".`)
const lucid = await Lucid(new MyBlockfrost(`https://cardano-${env.NETWORK.toLocaleLowerCase()}.blockfrost.io/api/v0`, blockfrostProjectId), env.NETWORK)
console.log('Finished initializing Lucid.')
const registry = registryByNetwork[env.NETWORK]

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
    const tx = await cancelOrderByOwner({ network: env.NETWORK, lucid, registry, orderUtxo })
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
  .command('protocol-data')
  .action(async (amount, options) => {
    const oracleUtxo = await lucid.utxoByUnit(registry.adaUsdOracleAssetId)
    const oracleInlineDatum = oracleUtxo.datum
    if (!oracleInlineDatum) throw new Error('Couldn\'t get oracle inline datum.')
    const oracleDatum = Data.from(oracleInlineDatum, OracleDatum)
    const poolUtxo = await lucid.utxoByUnit(registry.poolAssetId)
    const poolDatumCbor = poolUtxo.datum ?? Data.to(await lucid.datumOf(poolUtxo))
    const poolDatum = Data.from(poolDatumCbor, PoolDatum)
    console.log(JSON.stringify({
      djed: {
        buyPrice: djedADAMintRate(oracleDatum, registry.mintDJEDFeePercentage).toNumber(),
        sellPrice: djedADABurnRate(oracleDatum, registry.burnDJEDFeePercentage).toNumber(),
        circulatingSupply: Number(poolDatum.djedInCirculation) / 1e6,
        mintableAmount: Number(maxMintableDJED(poolDatum, oracleDatum, registry.mintDJEDFeePercentage)) / 1e6,
        burnableAmount: Number.POSITIVE_INFINITY,
      },
      shen: {
        buyPrice: shenADAMintRate(poolDatum, oracleDatum, registry.mintSHENFeePercentage).toNumber(),
        sellPrice: shenADABurnRate(poolDatum, oracleDatum, registry.burnSHENFeePercentage).toNumber(),
        circulatingSupply: Number(poolDatum.shenInCirculation) / 1e6,
        mintableAmount: Number(maxMintableSHEN(poolDatum, oracleDatum, registry.mintSHENFeePercentage)) / 1e6,
        burnableAmount: Number(maxBurnableSHEN(poolDatum, oracleDatum, registry.burnSHENFeePercentage)) / 1e6,
      },
      reserve: {
        amount: Number(poolDatum.adaInReserve) / 1e6,
        ratio: reserveRatio(poolDatum, oracleDatum).toNumber(),
      }
    }, undefined, 2))
  })

await program.parseAsync()