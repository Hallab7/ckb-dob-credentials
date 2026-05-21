"use client";
import { useState } from "react";
import Link from "next/link";
import { useCcc } from "@ckb-ccc/connector-react";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { useMyCredentials } from "@/hooks/useMyCredentials";
import { meltCredential, transferCredential } from "@/lib/transactions";

const TABS = [
  { id: "held", label: "My Credentials" },
  { id: "issued", label: "Issued Types" },
];

export default function WalletPage() {
  const { open, signerInfo } = useCcc();
  const { credentials, credentialTypes, loading, error, refetch } = useMyCredentials();
  const [tab, setTab] = useState("held");
  const [meltingId, setMeltingId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [txError, setTxError] = useState<string | null>(null);

  if (!signerInfo?.signer) {
    return (
      <div className="narrow-shell py-24 text-center">
        <p className="caption mb-5">Wallet</p>
        <h1 className="section-title mb-5 text-main">Connect to inspect credentials.</h1>
        <p className="body-copy mx-auto mb-8 max-w-lg">Your held credentials and issued clusters appear here after connecting.</p>
        <button onClick={open} className="btn btn-primary">
          Connect Wallet
        </button>
      </div>
    );
  }

  async function handleMelt(sporeId: string) {
    if (!signerInfo?.signer) return;
    if (!confirm("Melt this credential? The CKB will be returned to you.")) return;
    setMeltingId(sporeId); setTxError(null);
    try {
      await meltCredential(signerInfo.signer, sporeId);
      refetch();
    } catch (e: any) { setTxError(e?.message ?? "Failed"); }
    finally { setMeltingId(null); }
  }

  async function handleTransfer(sporeId: string) {
    if (!signerInfo?.signer || !transferTo.trim()) return;
    setTxError(null);
    setTransferringId(sporeId);
    try {
      await transferCredential(signerInfo.signer, sporeId, transferTo);
      setTransferTarget(null); setTransferTo("");
      refetch();
    } catch (e: any) { setTxError(e?.message ?? "Failed"); }
    finally { setTransferringId(null); }
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="caption mb-5">Wallet</p>
          <h1 className="section-title text-main">Credentials and issued types.</h1>
        </div>
        <p className="body-copy lg:col-span-4 lg:col-start-9">
          Manage credentials held by your connected wallet and continue issuing from clusters you created.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Credentials Held", value: credentials.length },
          { label: "Types Created", value: credentialTypes.length },
          { label: "Network", value: "Testnet" },
        ].map((s) => (
          <div key={s.label} className="surface-flat p-6">
            <p className="section-title text-main">{s.value}</p>
            <p className="caption mt-3">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex w-fit gap-1 rounded-full border border-[color:var(--border)] p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn px-5 ${tab === t.id ? "btn-primary" : "btn-quiet"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="surface-flat flex justify-between gap-4 p-5 text-muted">
          <span>{error}</span>
          <button onClick={refetch} className="font-medium text-main">Retry</button>
        </div>
      )}

      {txError && <div className="surface-flat p-5 text-muted">{txError}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="surface h-56 animate-pulse" />)}
        </div>
      ) : tab === "held" ? (
        credentials.length === 0 ? (
          <div className="surface-flat py-16 text-center text-muted">
            <p className="mb-5">No credentials yet.</p>
            <Link href="/explore" className="btn btn-secondary">Browse credential types</Link>
          </div>
        ) : (
          <>
            {transferTarget && (
              <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
                <input type="text" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="Recipient address (ckt1...)"
                  className="input flex-1 font-mono" />
                <button onClick={() => handleTransfer(transferTarget)} disabled={transferringId === transferTarget}
                  className="btn btn-primary disabled:opacity-40">
                  {transferringId === transferTarget ? "Sending..." : "Send"}
                </button>
                <button onClick={() => { setTransferTarget(null); setTransferTo(""); }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((c) => (
                <CredentialCard key={c.sporeId} credential={c} showActions
                  melting={meltingId === c.sporeId}
                  onMelt={() => handleMelt(c.sporeId)}
                  onTransfer={() => setTransferTarget(c.sporeId)} />
              ))}
            </div>
          </>
        )
      ) : (
        credentialTypes.length === 0 ? (
          <div className="surface-flat py-16 text-center text-muted">
            <p className="mb-5">No credential types created yet.</p>
            <Link href="/issue" className="btn btn-secondary">Create one</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {credentialTypes.map((ct) => (
              <CredentialTypeCard key={ct.clusterId} ct={ct} href={`/issue/${ct.clusterId}`} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
