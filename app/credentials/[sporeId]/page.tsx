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
    <div className="narrow-shell space-y-6">
      <Link href="/wallet" className="btn-quiet inline-flex">Back</Link>

      {loadError && <div className="surface-flat p-5 text-muted">{loadError}</div>}

      {resultTx && (
        <div className="surface-flat p-5 text-muted">
          Transaction sent.{" "}
          <a href={`https://testnet.explorer.nervos.org/transaction/${resultTx}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-main underline">{resultTx.slice(0, 20)}...</a>
        </div>
      )}

      {loading ? (
        <div className="surface h-72 animate-pulse" />
      ) : credential && (
        <div className="surface p-8">
          <div className="mb-8 flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
              <svg className="h-6 w-6 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <p className="caption">Verified</p>
              </div>
              <h1 className="section-title text-main">{credential.content.name}</h1>
              <p className="mt-4 text-sm text-muted">Issued by <span className="font-medium text-main">{credential.content.issuer}</span></p>
              <p className="mt-1 text-xs text-subtle">{credential.content.issuedAt}</p>
            </div>
          </div>

          {credential.content.description && (
            <p className="body-copy mb-8">{credential.content.description}</p>
          )}

          {credential.content.metadata && Object.keys(credential.content.metadata).length > 0 && (
            <div className="mb-8">
              <p className="caption mb-4">Metadata</p>
              <div className="space-y-3">
                {Object.entries(credential.content.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 text-sm">
                    <span className="text-muted">{k}</span>
                    <span className="font-medium text-main">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 space-y-3 border-t border-[color:var(--border)] pt-6">
            <InfoRow label="Holder" value={credential.holderAddress} />
            <InfoRow label="Spore ID" value={credential.sporeId} link={`https://testnet.explorer.nervos.org/transaction/${credential.txHash}`} />
            <InfoRow label="Cluster" value={credential.clusterId} link={`/explore/${credential.clusterId}`} internal />
          </div>

          {txError && <div className="surface-flat mb-5 p-4 text-sm text-muted">{txError}</div>}

          {isHolder && !showTransfer && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setShowTransfer(true)} className="btn btn-secondary flex-1">
                Transfer
              </button>
              <button onClick={handleMelt} disabled={pending} className="btn btn-secondary flex-1 disabled:opacity-40">
                {pending ? "Sending..." : "Melt & Reclaim CKB"}
              </button>
            </div>
          )}

          {isHolder && showTransfer && (
            <div className="space-y-3">
              <input type="text" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient address (ckt1...)"
                className="input font-mono" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setShowTransfer(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleTransfer} disabled={pending || !transferTo.trim()} className="btn btn-primary flex-1 disabled:opacity-40">
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
  const display = value.length > 30 ? `${value.slice(0, 20)}...${value.slice(-8)}` : value;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="caption shrink-0 text-[11px]">{label}</span>
      {link ? (
        internal
          ? <Link href={link} className="truncate font-mono text-xs text-main underline">{value.slice(0, 20)}...</Link>
          : <a href={link} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-xs text-main underline">{value.slice(0, 20)}...</a>
      ) : (
        <span className="truncate font-mono text-xs text-muted">{display}</span>
      )}
    </div>
  );
}
