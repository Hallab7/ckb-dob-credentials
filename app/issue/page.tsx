"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCcc } from "@ckb-ccc/connector-react";
import { createCredentialType } from "@/lib/transactions";

export default function IssuePage() {
  const router = useRouter();
  const { open, signerInfo } = useCcc();
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ txHash: string; clusterId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signerInfo?.signer) { open(); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await createCredentialType(signerInfo.signer, form.name, form.description);
      setResult(res);
    } catch (e: any) { setError(e?.message ?? "Transaction failed"); }
    finally { setSubmitting(false); }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Credential Type Created!</h2>
        <p className="text-sm text-slate-500 mb-1">Cluster ID:</p>
        <p className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-2 rounded-lg mb-4 break-all">{result.clusterId}</p>
        <a href={`https://testnet.explorer.nervos.org/transaction/${result.txHash}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs text-indigo-600 underline block mb-6">View transaction →</a>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/issue/${result.clusterId}`)}
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700">
            Issue Credentials Now
          </button>
          <button onClick={() => { setResult(null); setForm({ name: "", description: "" }); }}
            className="border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2 rounded-lg hover:border-slate-300">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create Credential Type</h1>
        <p className="text-sm text-slate-500">Define a credential schema as a Spore Cluster. You'll be able to issue credentials of this type to any address.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Field label="Name" hint="e.g. CKBuilder Week 1 Completion">
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Credential name" className="input" required />
        </Field>
        <Field label="Description" hint="What this credential represents">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe what this credential certifies..." rows={3} className="input resize-none" required />
        </Field>

        {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>}

        <button type="submit" disabled={!form.name.trim() || !form.description.trim() || submitting}
          className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? "Creating..." : !signerInfo?.signer ? "Connect Wallet to Continue" : "Create Credential Type"}
        </button>
      </form>

      <style jsx>{`
        .input { width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; outline: none; color: #0f172a; }
        .input:focus { border-color: #94a3b8; }
        .input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
