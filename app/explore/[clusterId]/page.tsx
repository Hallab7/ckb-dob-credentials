"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CredentialCard } from "@/components/CredentialCard";
import { getCredentialType, getCredentialsByType } from "@/lib/indexer";
import { Credential, CredentialType } from "@/lib/types";

export default function ClusterPage({ params }: { params: Promise<{ clusterId: string }> }) {
  const { clusterId } = use(params);
  const [ct, setCt] = useState<CredentialType | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const rawId = decodeURIComponent(clusterId);
  const normalizedId = rawId.startsWith("0x") ? rawId : `0x${rawId}`;

  useEffect(() => {
    // Show a "still loading" message after 5 seconds
    const timer = setTimeout(() => setTimedOut(true), 5000);

    Promise.all([
      getCredentialType(normalizedId),
      getCredentialsByType(normalizedId),
    ]).then(([type, creds]) => {
      setCt(type);
      setCredentials(creds);
    }).catch(() => {
      // errors are handled inside getCredentialType — nothing to do here
    }).finally(() => {
      setLoading(false);
      clearTimeout(timer);
    });

    return () => clearTimeout(timer);
  }, [normalizedId]);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Explore
      </Link>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          {timedOut && (
            <p className="text-xs text-slate-400 pt-2">
              Still scanning the chain for this cluster... this can take up to 30 seconds.
            </p>
          )}
        </div>
      ) : !ct ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Spore Cluster</h1>
          <p className="text-sm text-slate-500 mb-3">
            This cluster exists on-chain but uses a non-standard encoding (e.g. DOB/1 generative art).
            You can still issue credentials against it if you own it.
          </p>
          <p className="text-xs text-slate-400 mb-1">Cluster ID</p>
          <p className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg mb-4 break-all">
            {normalizedId}
          </p>
          <div className="flex gap-2">
            <Link href={`/issue/${normalizedId}`}
              className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Issue Credential
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-indigo-600 text-xl font-bold">{ct.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 mb-1">{ct.name}</h1>
                <p className="text-slate-500 text-sm">{ct.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-1">Issuer</p>
                <p className="text-xs font-mono text-slate-700 truncate">{ct.issuerAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Cluster ID</p>
                <p className="text-xs font-mono text-slate-700 truncate">{ct.clusterId}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/issue/${ct.clusterId}`}
                className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Issue Credential
              </Link>
              <a href={`https://testnet.explorer.nervos.org/transaction/${ct.txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:border-slate-300">
                View on Explorer
              </a>
            </div>
          </div>

          <h2 className="font-semibold text-slate-900 mb-4">
            Issued Credentials <span className="text-slate-400 font-normal">({credentials.length})</span>
          </h2>
          {credentials.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl">
              <p className="text-sm">No credentials issued yet.</p>
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
