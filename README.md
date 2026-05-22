# CredSpore — DOB Credential Protocol

On-chain verifiable credentials powered by [Spore Protocol](https://docs.spore.pro) on Nervos CKB. Issue credentials as Spore DOBs — each one is a cell owned by the holder, backed by locked CKB, and verifiable by anyone reading the chain.

Live at [credspore.vercel.app](https://credspore.vercel.app)

## How It Works

```
Issuer creates a Cluster (defines the credential type/schema)
    ↓
Issuer mints a Spore DOB to recipient's address (the credential)
    ↓
Recipient owns the cell — not the issuer, not the platform
    ↓
Anyone can verify by reading the cell on-chain
    ↓
Holder can melt the DOB to reclaim the locked CKB
```

No custom scripts. No backend. The Spore Protocol handles ownership, immutability, and melt-to-reclaim. CKB cells are the database.

## Cell Structure

### Credential Type (Spore Cluster)

```
Cluster Cell:
  data:   name + description (molecule-encoded)
  type:   CLUSTER_TYPE_DATA_HASH, args: CLUSTER_ID
  lock:   <issuer's lock>
```

### Credential (Spore DOB)

```
Spore Cell:
  data:
    content-type: "application/json"
    content: { name, issuedAt, issuer, description?, metadata? }
    cluster_id: CLUSTER_ID
  type:   SPORE_TYPE_DATA_HASH, args: SPORE_ID
  lock:   <recipient's lock>
```

## Project Structure

```
frontend/
  app/
    page.tsx                    # Home — recent credential types
    explore/                    # Browse all clusters
    explore/[clusterId]/        # Cluster detail + issued credentials
    credentials/[sporeId]/      # Credential detail + melt/transfer
    issue/                      # Create credential type
    issue/[clusterId]/          # Mint credentials to recipients
    wallet/                     # My credentials + my types
    verify/                     # Public verifier by address
  components/
    CredentialCard.tsx
    CredentialTypeCard.tsx
    Navbar.tsx
    ConnectButton.tsx
  lib/
    transactions.ts             # createCredentialType, issueCredential, melt, transfer
    indexer.ts                  # findSpores, findSporeClusters queries
    types.ts                    # Types + JSON codec
  hooks/
    useMyCredentials.ts
```

## Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Connect a CKB testnet wallet (JoyID, MetaMask, OKX).

## Usage

### Issue a Credential

1. Go to `/issue` and create a credential type (Cluster)
2. After creation, click "Issue Credentials Now"
3. Fill in recipient address, date, issuer name, and optional metadata
4. Approve the transaction — the credential is minted to the recipient

### Verify a Credential

Go to `/verify`, paste any CKB address, and see all credentials it holds. No wallet needed.

### Melt a Credential

Go to `/wallet`, click "Melt" on any credential you hold. The locked CKB is returned to you and the credential is destroyed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| DOB protocol | Spore Protocol (pre-deployed on testnet/mainnet) |
| CKB SDK | `@ckb-ccc/connector-react` + `@ckb-ccc/spore` |
| Frontend | Next.js 16 + TypeScript |
| Wallet | JoyID, MetaMask, OKX (via CCC) |
| Styling | Tailwind CSS |
| Network | CKB Testnet |

## Notes

- Only issue credentials against clusters you created — the `clusterCell` mode requires the issuer to sign
- MetaMask requires explicit `completeFeeBy(signer, 1000)` after the Spore SDK builds the transaction
- Clusters from other developers on testnet (DOB/1 generative art) show a graceful fallback on the detail page

## License

MIT
