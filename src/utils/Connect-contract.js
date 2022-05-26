import { Connection, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';

import Wallet from './Sollet';
import dataFarmJson from '../contracts/Datafarm.json'
import stakingJson from '../contracts/Staking.json'

const anchor = require('@project-serum/anchor');

export const connectSolletWallet = async () => {
  let connection = new Connection(clusterApiUrl('devnet'));

  let providerUrl = window.sollet;
  let wallet = new Wallet(providerUrl);
  wallet.on('connect', publicKey => { console.log(publicKey.toBase58()); localStorage.setItem("solletAddress", publicKey.toBase58()) });
  wallet.on('disconnect', () => { console.log('Disconnected') });
  // await wallet.connect();
  return localStorage.getItem("solletAddress");
}

export const connectPhantomWallet = async () => {
  window.solana.on("connect", (publicKey) => { console.log(publicKey.toBase58()); localStorage.setItem("phantomAddress", publicKey.toBase58()) })
  await window.solana.connect();
  return localStorage.getItem('phantomAddress');
}

export const connectMetamaskWallet = async () => {
  if (window.ethereum) {
    await window.ethereum.enable();
    let accounts = await window.ethereum.send("eth_requestAccounts");
    return accounts.result[0]
  }
}

export const setInitialize = async (publicKey) => {

  console.log("here")
  const { SystemProgram, Keypair } = anchor.web3;
  /* create an account  */

  const baseAccount = Keypair.generate();
  const opts = {
    preflightCommitment: "processed"
  }

  console.log(anchor.Provider)
  const provider = anchor.Provider.local("https://api.devnet.solana.com");

  const idlDataFarm = dataFarmJson;
  const idlStaking = stakingJson;
  const programId = publicKey;
  anchor.setProvider(provider);

  const dataFarmprogram = new anchor.Program(idlDataFarm, programId, provider);
  const stakingprogram = new anchor.Program(idlStaking, programId, provider);
  console.log("dataFarmProgram", dataFarmprogram);
  console.log("stakingProgram", stakingprogram);
  let user = anchor.web3.Keypair.generate();
  const tx = await dataFarmprogram.rpc.initialize({
    accounts: {
      myOntology: provider.wallet.publicKey,
      user: provider.wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    }
  });
  const tx1 = await stakingprogram.rpc.initialize({
    accounts: {
      myOntology: provider.wallet.publicKey,
      user: provider.wallet.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    }
  });
  console.log("\tTransaction Signature:\n\t", tx);
  console.log("\tTransaction Signature For Staking:\n\t", tx1);
  return true;
}