import { ccc } from "@ckb-ccc/connector-react";
import {
  findSpores,
  findSporeClusters,
  findSpore,
  findCluster,
  findSporesBySigner,
  findSporeClustersBySigner,
} from "@ckb-ccc/spore";
import {
  unpackToRawSporeData,
  unpackToRawClusterData,
} from "@ckb-ccc/spore/advanced";
import { Credential, CredentialType, decodeContent } from "./types";

function getClient(): ccc.ClientPublicTestnet {
  return new ccc.ClientPublicTestnet();
}

// ─── Cell parsers ─────────────────────────────────────────────────────────────

function parseClusterCell(
  cell: ccc.Cell,
  clusterId: string
): CredentialType | null {
  try {
    const raw = cell.outputData;
    if (!raw || raw === "0x") return null;

    const { name, description } = unpackToRawClusterData(raw);
    const issuerAddress = ccc.Address.fromScript(
      cell.cellOutput.lock,
      getClient()
    ).toString();

    return {
      clusterId,
      name,
      description,
      issuerAddress,
      txHash: cell.outPoint!.txHash,
      index: Number(cell.outPoint!.index),
    };
  } catch {
    return null;
  }
}

function parseSporeCell(
  cell: ccc.Cell,
  sporeId: string
): Credential | null {
  try {
    const raw = cell.outputData;
    if (!raw || raw === "0x") return null;

    const { contentType, content, clusterId } = unpackToRawSporeData(raw);

    // Only handle JSON credentials
    if (!contentType.includes("json")) return null;

    const contentBytes =
      typeof content === "string"
        ? Uint8Array.from(
            content
              .replace(/^0x/, "")
              .match(/.{2}/g)!
              .map((b) => parseInt(b, 16))
          )
        : new Uint8Array(content as ArrayBuffer);

    const credContent = decodeContent(contentBytes);
    const holderAddress = ccc.Address.fromScript(
      cell.cellOutput.lock,
      getClient()
    ).toString();

    return {
      sporeId,
      clusterId: clusterId ? String(clusterId) : "",
      holderAddress,
      txHash: cell.outPoint!.txHash,
      index: Number(cell.outPoint!.index),
      content: credContent,
    };
  } catch {
    return null;
  }
}

// ─── Public queries ───────────────────────────────────────────────────────────

/** All credentials held by a specific address */
export async function getCredentialsByHolder(
  address: string
): Promise<Credential[]> {
  const client = getClient();
  const addr = await ccc.Address.fromString(address, client);
  const results: Credential[] = [];

  for await (const { cell, spore } of findSpores({ client, lock: addr.script })) {
    const sporeId = spore.cellOutput.type!.args;
    const parsed = parseSporeCell(cell, sporeId);
    if (parsed) results.push(parsed);
  }

  return results;
}

/** All credentials issued under a specific cluster */
export async function getCredentialsByType(
  clusterId: string
): Promise<Credential[]> {
  const client = getClient();
  const results: Credential[] = [];

  for await (const { cell, spore } of findSpores({
    client,
    clusterId: clusterId as `0x${string}`,
  })) {
    const sporeId = spore.cellOutput.type!.args;
    const parsed = parseSporeCell(cell, sporeId);
    if (parsed) results.push(parsed);
  }

  return results;
}

/** Single credential by spore ID */
export async function getCredential(
  sporeId: string
): Promise<Credential | null> {
  const client = getClient();
  const result = await findSpore(client, sporeId as `0x${string}`);
  if (!result) return null;
  return parseSporeCell(result.cell, sporeId);
}

/** All credential types created by an issuer address */
export async function getCredentialTypesByIssuer(
  address: string
): Promise<CredentialType[]> {
  const client = getClient();
  const addr = await ccc.Address.fromString(address, client);
  const results: CredentialType[] = [];

  for await (const { cell, cluster } of findSporeClusters({
    client,
    lock: addr.script,
  })) {
    const clusterId = cluster.cellOutput.type!.args;
    const parsed = parseClusterCell(cell, clusterId);
    if (parsed) results.push(parsed);
  }

  return results;
}

/** Single credential type by cluster ID */
export async function getCredentialType(
  clusterId: string
): Promise<CredentialType | null> {
  const client = getClient();
  // Ensure 0x prefix
  const id = clusterId.startsWith("0x") ? clusterId : `0x${clusterId}`;
  const result = await findCluster(client, id as `0x${string}`);
  if (!result) return null;
  return parseClusterCell(result.cell, id);
}

/** All credential types on testnet (paginated) */
export async function getAllCredentialTypes(
  limit = 50
): Promise<CredentialType[]> {
  const client = getClient();
  const results: CredentialType[] = [];
  let count = 0;

  for await (const { cell, cluster } of findSporeClusters({ client })) {
    const clusterId = cluster.cellOutput.type!.args;
    const parsed = parseClusterCell(cell, clusterId);
    if (parsed) {
      results.push(parsed);
      if (++count >= limit) break;
    }
  }

  return results;
}

/** Credentials held by the connected signer */
export async function getMyCredentials(
  signer: ccc.Signer
): Promise<Credential[]> {
  const results: Credential[] = [];

  for await (const { cell, spore } of findSporesBySigner({ signer })) {
    const sporeId = spore.cellOutput.type!.args;
    const parsed = parseSporeCell(cell, sporeId);
    if (parsed) results.push(parsed);
  }

  return results;
}

/** Credential types created by the connected signer */
export async function getMyCredentialTypes(
  signer: ccc.Signer
): Promise<CredentialType[]> {
  const results: CredentialType[] = [];

  for await (const { cell, cluster } of findSporeClustersBySigner({ signer })) {
    const clusterId = cluster.cellOutput.type!.args;
    const parsed = parseClusterCell(cell, clusterId);
    if (parsed) results.push(parsed);
  }

  return results;
}
