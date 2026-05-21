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
import {
  CREDENTIAL_CONTENT_TYPE,
  Credential,
  CredentialType,
  decodeContent,
  isCredentialContent,
} from "./types";

function getClient(): ccc.ClientPublicTestnet {
  return new ccc.ClientPublicTestnet();
}

function normalizeHex(value: string): `0x${string}` {
  return (value.startsWith("0x") ? value : `0x${value}`) as `0x${string}`;
}

function bytesFromHex(hex: string): Uint8Array | null {
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(clean)) return null;

  const bytes = clean.match(/.{2}/g);
  if (!bytes) return new Uint8Array();
  return Uint8Array.from(bytes.map((b) => parseInt(b, 16)));
}

function parseClusterCell(
  cell: ccc.Cell,
  clusterId: string,
  decodedData?: { name: string; description: string }
): CredentialType | null {
  try {
    let name: string;
    let description: string;

    if (decodedData) {
      name = decodedData.name ?? "Unnamed";
      description = decodedData.description ?? "";
    } else {
      const raw = cell.outputData;
      if (!raw || raw === "0x") return null;

      let decoded: { name: string; description: string };
      try {
        decoded = unpackToRawClusterData(raw, "v2");
      } catch {
        try {
          decoded = unpackToRawClusterData(raw, "v1");
        } catch {
          decoded = unpackToRawClusterData(raw);
        }
      }
      name = decoded.name ?? "Unnamed";
      description = decoded.description ?? "";
    }

    const issuerAddress = ccc.Address.fromScript(
      cell.cellOutput.lock,
      getClient()
    ).toString();

    return {
      clusterId,
      name,
      description,
      issuerAddress,
      issuerLockHash: cell.cellOutput.lock.hash(),
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
    if (contentType !== CREDENTIAL_CONTENT_TYPE) return null;

    const contentBytes =
      typeof content === "string"
        ? bytesFromHex(content)
        : new Uint8Array(content as ArrayBuffer);
    if (!contentBytes) return null;

    const credContent = decodeContent(contentBytes);
    if (!isCredentialContent(credContent)) return null;

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
    clusterId: normalizeHex(clusterId),
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
  const result = await findSpore(client, normalizeHex(sporeId));
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
  const id = normalizeHex(clusterId);
  const result = await findCluster(client, id);
  if (!result) return null;

  return parseClusterCell(result.cell, id) ?? {
    clusterId: id,
    name: "Unknown Cluster",
    description: "This cluster uses a non-standard encoding.",
    issuerAddress: ccc.Address.fromScript(result.cell.cellOutput.lock, client).toString(),
    issuerLockHash: result.cell.cellOutput.lock.hash(),
    txHash: result.cell.outPoint!.txHash,
    index: Number(result.cell.outPoint!.index),
  };
}

/** All credential types on testnet (paginated) */
export async function getAllCredentialTypes(
  limit = 200
): Promise<CredentialType[]> {
  const client = getClient();
  const results: CredentialType[] = [];
  let count = 0;

  for await (const { cell, cluster } of findSporeClusters({ client })) {
    try {
      const clusterId = cluster.cellOutput.type!.args;
      const parsed = parseClusterCell(cell, clusterId);
      if (parsed) {
        results.push(parsed);
        if (++count >= limit) break;
      }
    } catch {
      // Skip clusters this app cannot decode.
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
