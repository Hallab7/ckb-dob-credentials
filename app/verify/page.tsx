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
    } catch (e: any) {
      setError("Failed to query credentials. Check the address and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Verify Credentials</h1>
        <p className="text-sm text-slate-500">
          Paste any CKB address to see all on-chain credentials it holds.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="ckt1qzda0cr08m85hc8jlnfp3zer7..."
          className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 font-mono placeholder-slate-400" />
        <button type="submit" disabled={!address.trim() || loading}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40">
          {loading ? "Searching..." : "Verify"}
        </button>
      </form>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>
      )}

      {credentials !== null && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {credentials.length} credential{credentials.length !== 1 ? "s" : ""} found
              </p>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{searched}</p>
            </div>
            {credentials.length > 0 && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-medium">
                ✓ Verified on-chain
              </span>
            )}
          </div>

          {credentials.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm">No credentials found for this address.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((c) => <CredentialCard key={c.sporeId} credential={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
