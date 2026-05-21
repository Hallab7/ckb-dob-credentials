"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useCcc } from "@ckb-ccc/connector-react";
import { getCredentialType } from "@/lib/indexer";
import { issueCredential } from "@/lib/transactions";
import { CredentialType } from "@/lib/types";

interface IssuedResult { recipient: string; txHash: string; sporeId: string; }

export default function IssueCredentialPage({ params }: { params: Promise<{ clusterId: string }> }) {
  const { clusterId } = use(params);
  const { open, signerInfo } = useCcc();
  const [ct, setCt] = useState<CredentialType | null>(null);
  const [myAddress, setMyAddress] = useState<string | null>(null);
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
    if (!signerInfo?.signer) { setMyAddress(null); return; }
    signerInfo.signer.getRecommendedAddress().then(setMyAddress).catch(() => setMyAddress(null));
  }, [signerInfo]);

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
      <Link href="/issue" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {ct && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
            {ct.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">{ct.name}</p>
            <p className="text-xs text-indigo-600">{ct.description}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Issue Credential</h1>
        <p className="text-sm text-slate-500">Mint a credential DOB to a recipient's address.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Field label="Recipient Address">
          <div className="relative">
            <input type="text" value={form.recipient} onChange={(e) => set("recipient", e.target.value)}
              placeholder="ckt1..." className="input pr-24 font-mono text-xs" required />
            {myAddress && (
              <button type="button" onClick={() => set("recipient", myAddress)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Metadata (optional)</label>
          {Object.entries(metadata).length > 0 && (
            <div className="mb-2 space-y-1">
              {Object.entries(metadata).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-500">{k}: <span className="text-slate-700 font-medium">{v}</span></span>
                  <button type="button" onClick={() => setMetadata((m) => { const n = { ...m }; delete n[k]; return n; })}
                    className="text-slate-400 hover:text-red-500">×</button>
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
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 shrink-0">
              Add
            </button>
          </div>
        </div>

        {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>}

        <button type="submit" disabled={!form.recipient.trim() || submitting}
          className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? "Issuing..." : !signerInfo?.signer ? "Connect Wallet" : "Issue Credential"}
        </button>
      </form>

      {/* Issued results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-slate-900 mb-3">Issued ({results.length})</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <p className="text-xs text-emerald-700 font-mono truncate mb-1">→ {r.recipient}</p>
                <a href={`https://testnet.explorer.nervos.org/transaction/${r.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-emerald-600 underline">View transaction</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .input { width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; outline: none; color: #0f172a; }
        .input:focus { border-color: #94a3b8; }
        .input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
