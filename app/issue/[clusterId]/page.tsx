"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ccc, useCcc } from "@ckb-ccc/connector-react";
import { getCredentialType } from "@/lib/indexer";
import { issueCredential } from "@/lib/transactions";
import { CredentialType } from "@/lib/types";

interface IssuedResult { recipient: string; txHash: string; sporeId: string; }

export default function IssueCredentialPage({ params }: { params: Promise<{ clusterId: string }> }) {
  const { clusterId } = use(params);
  const { open, signerInfo } = useCcc();
  const [ct, setCt] = useState<CredentialType | null>(null);
  const [myAddress, setMyAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean | null>(null); // null = unknown
  const [form, setForm] = useState({
    recipient: "", issuedAt: new Date().toISOString().split("T")[0],
    issuer: "", description: "", metaKey: "", metaValue: "",
  });
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<IssuedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCredentialType(decodeURIComponent(clusterId)).then(setCt).catch(() => {});
  }, [clusterId]);

  useEffect(() => {
    if (!signerInfo?.signer) { setMyAddress(null); setIsOwner(null); return; }
    signerInfo.signer.getRecommendedAddress().then(async (addr) => {
      setMyAddress(addr);
      if (ct) {
        const address = await ccc.Address.fromString(addr, signerInfo.signer.client);
        const lockHash = address.script.hash();
        setIsOwner(ct.issuerLockHash === lockHash);
      }
    }).catch(() => setMyAddress(null));
  }, [signerInfo, ct]);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function addMeta() {
    if (!form.metaKey.trim() || !form.metaValue.trim()) return;
    setMetadata((m) => ({ ...m, [form.metaKey]: form.metaValue }));
    setForm((f) => ({ ...f, metaKey: "", metaValue: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signerInfo?.signer) { open(); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await issueCredential(
        signerInfo.signer,
        decodeURIComponent(clusterId),
        form.recipient,
        {
          name: ct?.name ?? "Credential",
          issuedAt: form.issuedAt,
          issuer: form.issuer || myAddress || "Unknown",
          description: form.description || undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        }
      );
      setResults((r) => [...r, { recipient: form.recipient, ...res }]);
      setForm((f) => ({ ...f, recipient: "" }));
    } catch (e: any) { setError(e?.message ?? "Transaction failed"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/issue" className="btn-quiet mb-6 inline-flex">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {ct && (
        <div className="surface mb-8 flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
            {ct.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-main">{ct.name}</p>
            <p className="text-xs text-muted">{ct.description}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="caption mb-5">Issue</p>
        <h1 className="section-title mb-4 text-main">Issue credential.</h1>
        <p className="body-copy">Mint a credential DOB to a recipient address.</p>
      </div>

      <form onSubmit={handleSubmit} className="surface space-y-6 p-7">
        <Field label="Recipient Address">
          <div className="relative">
            <input type="text" value={form.recipient} onChange={(e) => set("recipient", e.target.value)}
              placeholder="ckt1..." className="input pr-24 font-mono text-xs" required />
            {myAddress && (
              <button type="button" onClick={() => set("recipient", myAddress)}
                className="btn btn-secondary absolute right-2 top-1/2 min-h-8 -translate-y-1/2 px-3 text-xs">
                Use mine
              </button>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Issued Date">
            <input type="date" value={form.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} className="input" required />
          </Field>
          <Field label="Issuer Name">
            <input type="text" value={form.issuer} onChange={(e) => set("issuer", e.target.value)}
              placeholder="e.g. CKBuilder Program" className="input" />
          </Field>
        </div>

        <Field label="Description (optional)">
          <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Additional notes..." className="input" />
        </Field>

        {/* Metadata */}
        <div>
          <label className="caption mb-2 block">Metadata (optional)</label>
          {Object.entries(metadata).length > 0 && (
            <div className="mb-2 space-y-1">
              {Object.entries(metadata).map(([k, v]) => (
                <div key={k} className="surface-flat flex items-center justify-between px-3 py-2 text-xs">
                  <span className="text-muted">{k}: <span className="font-medium text-main">{v}</span></span>
                  <button type="button" onClick={() => setMetadata((m) => { const n = { ...m }; delete n[k]; return n; })}
                    className="text-subtle hover:text-main">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={form.metaKey} onChange={(e) => set("metaKey", e.target.value)}
              placeholder="Key" className="input flex-1" />
            <input type="text" value={form.metaValue} onChange={(e) => set("metaValue", e.target.value)}
              placeholder="Value" className="input flex-1" />
            <button type="button" onClick={addMeta}
              className="btn btn-secondary shrink-0">
              Add
            </button>
          </div>
        </div>

        {error && <div className="surface-flat p-4 text-sm text-muted">{error}</div>}

        {isOwner === false && (
          <div className="surface-flat p-4 text-sm text-muted">
            You are not the owner of this cluster. Issuing will fail unless you own the cluster's lock script.
          </div>
        )}

        <button type="submit" disabled={!form.recipient.trim() || submitting}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">
          {submitting ? "Issuing..." : !signerInfo?.signer ? "Connect Wallet" : "Issue Credential"}
        </button>
      </form>

      {/* Issued results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.04em] text-main">Issued ({results.length})</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="surface-flat px-4 py-3">
                <p className="mb-1 truncate font-mono text-xs text-muted">To: {r.recipient}</p>
                <a href={`https://testnet.explorer.nervos.org/transaction/${r.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-main underline">View transaction</a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="caption mb-2 block">{label}</label>
      {children}
    </div>
  );
}
