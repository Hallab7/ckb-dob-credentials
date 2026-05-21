"use client";
import { useEffect, useState } from "react";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { getAllCredentialTypes } from "@/lib/indexer";
import { CredentialType } from "@/lib/types";

export default function ExplorePage() {
  const [types, setTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCredentialTypes(100).then(setTypes).catch(() => setTypes([])).finally(() => setLoading(false));
  }, []);

  const filtered = types.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Explore Credential Types</h1>
        <p className="text-slate-500 text-sm">Browse all credential schemas issued on CKB testnet.</p>
      </div>

      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search credential types..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 placeholder-slate-400" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-100 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm">{search ? "No results found." : "No credential types on-chain yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ct) => <CredentialTypeCard key={ct.clusterId} ct={ct} />)}
        </div>
      )}
    </div>
  );
}
