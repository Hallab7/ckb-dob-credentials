export interface CredentialType {
  clusterId: string;        // hex, the Cluster cell's type args
  name: string;
  description: string;
  issuerAddress: string;
  issuerLockHash: string;
  txHash: string;
  index: number;
}

export interface Credential {
  sporeId: string;          // hex, the Spore cell's type args
  clusterId: string;
  holderAddress: string;
  txHash: string;
  index: number;
  content: CredentialContent;
}

export interface CredentialContent {
  schema?: "dob-credentials/v1";
  name: string;
  issuedAt: string;         // ISO date string
  issuer: string;           // human-readable issuer name
  description?: string;
  metadata?: Record<string, string>;
}

export const CREDENTIAL_SCHEMA = "dob-credentials/v1";
export const CREDENTIAL_CONTENT_TYPE = "application/vnd.dob-credentials+json";

export function encodeContent(content: CredentialContent): Uint8Array {
  return new TextEncoder().encode(
    JSON.stringify({ schema: CREDENTIAL_SCHEMA, ...content })
  );
}

export function decodeContent(raw: Uint8Array | string): CredentialContent {
  const str =
    typeof raw === "string"
      ? raw.startsWith("0x")
        ? new TextDecoder().decode(hexToBytes(raw))
        : raw
      : new TextDecoder().decode(raw);
  return JSON.parse(str) as CredentialContent;
}

export function isCredentialContent(value: unknown): value is CredentialContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;

  return (
    content.schema === CREDENTIAL_SCHEMA &&
    typeof content.name === "string" &&
    content.name.trim().length > 0 &&
    typeof content.issuedAt === "string" &&
    content.issuedAt.trim().length > 0 &&
    typeof content.issuer === "string" &&
    content.issuer.trim().length > 0 &&
    (content.description === undefined || typeof content.description === "string") &&
    (content.metadata === undefined ||
      (typeof content.metadata === "object" &&
        content.metadata !== null &&
        Object.values(content.metadata).every((v) => typeof v === "string")))
  );
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
