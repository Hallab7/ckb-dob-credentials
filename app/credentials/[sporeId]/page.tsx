"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCcc } from "@ckb-ccc/connector-react";
import { getCredential } from "@/lib/indexer";
import { meltCredential, transferCredential } from "@/lib/transactions";
import { Credential } from "@/lib/types";

export default function CredentialPage({ params }: { params: Promise<{ sporeId: string }> }) {
  const { sporeId } = use(params);
  const { open, signerInfo } = useCcc();
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [myAddress, setMyAddress] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resultTx, setResultTx] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);

  useEffect(() => {
    setLoadError(null);
    getCredential(decodeURIComponent(sporeId))
      .then(setCredential)
      .catch(() => setLoadError("Failed to load this credential from CKB testnet."))
      .finally(() => setLoading(false));
  }, [sporeId]);

  useEffect(() => {
    if (!signerInfo?.signer) { setMyAddress(null); return; }
    signerInfo.signer.getRecommendedAddress().then(setMyAddress).catch(() => setMyAddress(null));
  }, [signerInfo]);

  if (!loading && !credential && !loadError) return notFound();

  const isHolder = myAddress && credential?.holderAddress === myAddress;

  async function handleMelt() {
    if (!signerInfo?.signer) { open(); return; }
    if (!confirm("Melt this credential? You will reclaim the locked CKB but the credential will be destroyed.")) return;
    setPending(true); setTxError(null);
    try {
      const hash = await meltCredential(signerInfo.signer, credential!.sporeId);
      setResultTx(hash);
    } catch (e: any) { setTxError(e?.message ?? "Transaction failed"); }
    finally { setPending(false); }
  }

  async function handleTransfer() {
    if (!signerInfo?.signer) { open(); return; }
    if (!transferTo.trim()) return;
    setPending(true); setTxError(null);
    try {
      const hash = await transferCredential(signerInfo.signer, credential!.sporeId, transferTo);
      setResultTx(hash);
      setShowTransfer(false);
    } catch (e: any) { setTxError(e?.message ?? "Transaction failed"); }
    finally { setPending(false); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/wallet" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {loadError && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          {loadError}
        </div>
      )}

      {resultTx && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          Transaction sent!{" "}
          <a href={`https://testnet.explorer.nervos.org/transaction/${resultTx}`} target="_blank" rel="noopener noreferrer" className="underline font-mono text-xs">{resultTx.slice(0, 20)}...</a>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-slate-100 mb-4" />
          <div className="h-6 bg-slate-100 rounded w-1/2 mb-3" />
          <div className="h-4 bg-slate-100 rounded w-full mb-2" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </div>
      ) : credential && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-slate-900">{credential.content.name}</h1>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Verified</span>
              </div>
              <p className="text-sm text-slate-500">Issued by <span className="font-medium text-slate-700">{credential.content.issuer}</span></p>
              <p className="text-xs text-slate-400 mt-0.5">{credential.content.issuedAt}</p>
            </div>
          </div>

          {credential.content.description && (
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{credential.content.description}</p>
          )}

          {credential.content.metadata && Object.keys(credential.content.metadata).length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metadata</p>
              <div className="space-y-1">
                {Object.entries(credential.content.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-700 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-slate-100 mb-4">
            <InfoRow label="Holder" value={credential.holderAddress} />
            <InfoRow label="Spore ID" value={credential.sporeId} link={`https://testnet.explorer.nervos.org/transaction/${credential.txHash}`} />
            <InfoRow label="Cluster" value={credential.clusterId} link={`/explore/${credential.clusterId}`} internal />
          </div>

          {txError && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{txError}</div>
          )}

          {isHolder && !showTransfer && (
            <div className="flex gap-2">
              <button onClick={() => setShowTransfer(true)}
                className="flex-1 text-sm font-medium py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300">
                Transfer
              </button>
              <button onClick={handleMelt} disabled={pending}
                className="flex-1 text-sm font-medium py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
                {pending ? "Sending..." : "Melt & Reclaim CKB"}
              </button>
            </div>
          )}

          {isHolder && showTransfer && (
            <div className="space-y-2">
              <input type="text" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient address (ckt1...)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-mono" />
              <div className="flex gap-2">
                <button onClick={() => setShowTransfer(false)}
                  className="flex-1 text-sm py-2 rounded-lg border border-slate-200 text-slate-500">
                  Cancel
                </button>
                <button onClick={handleTransfer} disabled={pending || !transferTo.trim()}
                  className="flex-1 text-sm font-medium py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40">
                  {pending ? "Sending..." : "Confirm Transfer"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, link, internal }: { label: string; value: string; link?: string; internal?: boolean }) {
  const text = <span className="text-xs font-mono text-slate-700 truncate">{value.length > 30 ? `${value.slice(0, 20)}...${value.slice(-8)}` : value}</span>;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      {link ? (
        internal
          ? <Link href={link} className="text-xs font-mono text-indigo-600 hover:underline truncate">{value.slice(0, 20)}...</Link>
          : <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-indigo-600 hover:underline truncate">{value.slice(0, 20)}...</a>
      ) : text}
    </div>
  );
}
