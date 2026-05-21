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
      <div className="narrow-shell py-16 text-center">
        <p className="caption mb-5">Cluster created</p>
        <h1 className="section-title mb-8 text-main">Credential type is on-chain.</h1>
        <div className="surface-flat mb-6 p-5 text-left">
          <p className="caption mb-3">Cluster ID</p>
          <p className="break-all font-mono text-xs text-muted">{result.clusterId}</p>
        </div>
        <a href={`https://testnet.explorer.nervos.org/transaction/${result.txHash}`}
          target="_blank" rel="noopener noreferrer"
          className="mb-8 inline-flex text-sm font-medium text-main hover:opacity-70">
          View transaction
        </a>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => router.push(`/issue/${result.clusterId}`)} className="btn btn-primary">
            Issue Credentials Now
          </button>
          <button onClick={() => { setResult(null); setForm({ name: "", description: "" }); }} className="btn btn-secondary">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="narrow-shell">
      <div className="mb-10">
        <p className="caption mb-5">Issue</p>
        <h1 className="section-title mb-4 text-main">Create credential type.</h1>
        <p className="body-copy">
          Define a credential schema as a Spore Cluster. You can issue credentials of this type to any address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="surface space-y-6 p-7">
        <Field label="Name" hint="Example: CKBuilder Week 1 Completion">
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Credential name" className="input" required />
        </Field>
        <Field label="Description" hint="What this credential represents">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe what this credential certifies..." rows={4} className="input resize-none" required />
        </Field>

        {error && <div className="surface-flat p-4 text-sm text-muted">{error}</div>}

        <button type="submit" disabled={!form.name.trim() || !form.description.trim() || submitting}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">
          {submitting ? "Creating..." : !signerInfo?.signer ? "Connect Wallet to Continue" : "Create Credential Type"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="caption mb-2 block">{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
