"use client";
import { useState } from "react";
import { CredentialCard } from "@/components/CredentialCard";
import { getCredentialsByHolder } from "@/lib/indexer";
import { Credential } from "@/lib/types";

export default function VerifyPage() {
  const [address, setAddress] = useState("");
  const [credentials, setCredentials] = useState<Credential[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true); setError(null); setCredentials(null);
    try {
      const creds = await getCredentialsByHolder(address.trim());
      setCredentials(creds);
      setSearched(address.trim());
    } catch {
      setError("Failed to query credentials. Check the address and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="editorial-shell space-y-10">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="caption mb-5">Verify</p>
          <h1 className="section-title text-main">Inspect holder credentials.</h1>
        </div>
        <p className="body-copy lg:col-span-4 lg:col-start-9">
          Paste a CKB address to read all CredSpore credentials held by that lock script.
        </p>
      </section>

      <form onSubmit={handleSearch} className="surface flex flex-col gap-3 p-3 sm:flex-row">
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="ckt1qzda0cr08m85hc8jlnfp3zer7..."
          className="input flex-1 font-mono" />
        <button type="submit" disabled={!address.trim() || loading}
          className="btn btn-primary disabled:opacity-40">
          {loading ? "Searching..." : "Verify"}
        </button>
      </form>

      {error && <div className="surface-flat p-5 text-muted">{error}</div>}

      {credentials !== null && (
        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-3 border-b border-[color:var(--border)] pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="caption mb-2">
                {credentials.length} credential{credentials.length !== 1 ? "s" : ""} found
              </p>
              <p className="max-w-xs truncate font-mono text-xs text-subtle">{searched}</p>
            </div>
            {credentials.length > 0 && <span className="caption">Verified on-chain</span>}
          </div>

          {credentials.length === 0 ? (
            <div className="surface-flat py-14 text-center text-muted">
              No credentials found for this address.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {credentials.map((c) => <CredentialCard key={c.sporeId} credential={c} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
