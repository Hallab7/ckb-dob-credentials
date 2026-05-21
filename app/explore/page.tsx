"use client";
import { useEffect, useState } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { getAllCredentialTypes, getMyCredentialTypes } from "@/lib/indexer";
import { CredentialType } from "@/lib/types";

export default function ExplorePage() {
  const { signerInfo } = useCcc();
  const [types, setTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [all, mine] = await Promise.all([
          getAllCredentialTypes(200),
          signerInfo?.signer ? getMyCredentialTypes(signerInfo.signer) : Promise.resolve([]),
        ]);

        const myIds = new Set(mine.map((c) => c.clusterId.toLowerCase()));
        const others = all.filter((c) => !myIds.has(c.clusterId.toLowerCase()));
        setTypes([...mine, ...others]);
      } catch {
        setTypes([]);
        setError("Failed to load credential types from CKB testnet.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [signerInfo]);

  const filtered = types.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="caption mb-5">Explore</p>
          <h1 className="section-title text-main">Credential types on CKB testnet.</h1>
        </div>
        <p className="body-copy lg:col-span-4 lg:col-start-9">
          Browse credential schemas. When connected, clusters controlled by your wallet appear first.
        </p>
      </section>

      <div className="relative max-w-2xl">
        <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search credential types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-11"
        />
      </div>

      {error ? (
        <div className="surface-flat p-8 text-muted">{error}</div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="surface h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-flat py-16 text-center text-muted">
          {search ? "No results found." : "No credential types found."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ct) => <CredentialTypeCard key={ct.clusterId} ct={ct} />)}
        </div>
      )}
    </div>
  );
}
