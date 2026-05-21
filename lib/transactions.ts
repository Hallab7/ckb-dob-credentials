import { ccc } from "@ckb-ccc/connector-react";
import {
  createSporeCluster,
  createSpore,
  meltSpore,
  transferSpore,
} from "@ckb-ccc/spore";
import { encodeContent, CredentialContent } from "./types";

// CKB testnet max fee rate is 10,000,000 shannons/KB
// Use 1,000 as a safe rate (1000 shannons per byte = well under the limit)
const FEE_RATE = 1000;

/**
 * After the Spore SDK builds a tx, re-complete the fee at a safe rate.
 * This is needed because MetaMask's fee estimation can exceed the node limit.
 */
async function completeFee(tx: ccc.Transaction, signer: ccc.Signer): Promise<void> {
  await tx.completeFeeBy(signer, FEE_RATE);
}

// ─── Cluster (Credential Type) ───────────────────────────────────────────────

export async function createCredentialType(
  signer: ccc.Signer,
  name: string,
  description: string
): Promise<{ txHash: string; clusterId: string }> {
  const { tx, id } = await createSporeCluster({
    signer,
    data: { name, description },
  });

  await completeFee(tx, signer);
  const txHash = await signer.sendTransaction(tx);
  return { txHash, clusterId: id };
}

// ─── Spore (Credential) ───────────────────────────────────────────────────────

export async function issueCredential(
  signer: ccc.Signer,
  clusterId: string,
  recipientAddress: string,
  content: CredentialContent
): Promise<{ txHash: string; sporeId: string }> {
  const client = signer.client;
  const recipientAddr = await ccc.Address.fromString(recipientAddress, client);

  const { tx, id } = await createSpore({
    signer,
    data: {
      contentType: "application/json",
      content: encodeContent(content),
      clusterId: clusterId as `0x${string}`,
    },
    to: recipientAddr.script,
    clusterMode: "lockProxy",
  });

  await completeFee(tx, signer);
  const txHash = await signer.sendTransaction(tx);
  return { txHash, sporeId: id };
}

export async function meltCredential(
  signer: ccc.Signer,
  sporeId: string
): Promise<string> {
  const { tx } = await meltSpore({
    signer,
    id: sporeId as `0x${string}`,
  });

  await completeFee(tx, signer);
  return await signer.sendTransaction(tx);
}

export async function transferCredential(
  signer: ccc.Signer,
  sporeId: string,
  toAddress: string
): Promise<string> {
  const client = signer.client;
  const toAddr = await ccc.Address.fromString(toAddress, client);

  const { tx } = await transferSpore({
    signer,
    id: sporeId as `0x${string}`,
    to: toAddr.script,
  });

  await completeFee(tx, signer);
  return await signer.sendTransaction(tx);
}
