"use client";
import { useState } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { useMyCredentials } from "@/hooks/useMyCredentials";
import { meltCredential, transferCredential } from "@/lib/transactions";
import Link from "next/link";

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
      <div className="text-center py-24">
        <p className="text-slate-500 text-sm mb-4">Connect your wallet to view your credentials.</p>
        <button onClick={open} className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700">
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">My Wallet</h1>
        <p className="text-sm text-slate-500">Credentials you hold and credential types you've created.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Credentials Held", value: credentials.length },
          { label: "Types Created", value: credentialTypes.length },
          { label: "Network", value: "Testnet" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={refetch} className="text-xs underline">Retry</button>
        </div>
      )}

      {txError && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{txError}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-100 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : tab === "held" ? (
        credentials.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
            <p className="text-sm mb-2">No credentials yet.</p>
            <Link href="/explore" className="text-indigo-600 text-sm hover:underline">Browse credential types -&gt;</Link>
          </div>
        ) : (
          <>
            {transferTarget && (
              <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 flex gap-2">
                <input type="text" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="Recipient address (ckt1...)"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono" />
                <button onClick={() => handleTransfer(transferTarget)} disabled={transferringId === transferTarget}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40">
                  {transferringId === transferTarget ? "Sending..." : "Send"}
                </button>
                <button onClick={() => { setTransferTarget(null); setTransferTo(""); }}
                  className="px-4 py-2 border border-slate-200 text-slate-500 text-sm rounded-lg">Cancel</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
            <p className="text-sm mb-2">No credential types created yet.</p>
            <Link href="/issue" className="text-indigo-600 text-sm hover:underline">Create one -&gt;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentialTypes.map((ct) => (
              <CredentialTypeCard key={ct.clusterId} ct={ct} href={`/issue/${ct.clusterId}`} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
