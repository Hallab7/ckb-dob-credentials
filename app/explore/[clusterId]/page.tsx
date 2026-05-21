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
    const timer = setTimeout(() => setTimedOut(true), 5000);
    setError(null);

    Promise.all([
      getCredentialType(normalizedId),
      getCredentialsByType(normalizedId),
    ]).then(([type, creds]) => {
      setCt(type);
      setCredentials(creds);
    }).catch(() => {
      setError("Failed to load this cluster from CKB testnet.");
    }).finally(() => {
      setLoading(false);
      clearTimeout(timer);
    });

    return () => clearTimeout(timer);
  }, [normalizedId]);

  return (
    <div className="editorial-shell space-y-8">
      <Link href="/explore" className="btn-quiet inline-flex">Back to Explore</Link>

      {error ? (
        <div className="surface-flat p-6 text-muted">{error}</div>
      ) : loading ? (
        <div className="surface h-56 animate-pulse p-6">
          {timedOut && <p className="text-sm text-muted">Still scanning the chain for this cluster...</p>}
        </div>
      ) : !ct ? (
        <div className="surface p-8">
          <p className="caption mb-5">Spore Cluster</p>
          <h1 className="section-title mb-5 text-main">Non-standard cluster.</h1>
          <p className="body-copy mb-6">
            This cluster exists on-chain but uses a non-standard encoding. You can still issue credentials against it if you own it.
          </p>
          <p className="caption mb-2">Cluster ID</p>
          <p className="mb-6 break-all font-mono text-xs text-muted">{normalizedId}</p>
          <Link href={`/issue/${normalizedId}`} className="btn btn-primary">Issue Credential</Link>
        </div>
      ) : (
        <>
          <section className="surface p-8">
            <div className="mb-8 flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
                <span className="text-2xl font-semibold text-main">{ct.name.charAt(0)}</span>
              </div>
              <div>
                <p className="caption mb-3">Cluster</p>
                <h1 className="section-title text-main">{ct.name}</h1>
                <p className="body-copy mt-4">{ct.description}</p>
              </div>
            </div>
            <div className="grid gap-5 border-t border-[color:var(--border)] pt-6 md:grid-cols-2">
              <Info label="Issuer" value={ct.issuerAddress} />
              <Info label="Cluster ID" value={ct.clusterId} />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/issue/${ct.clusterId}`} className="btn btn-primary">Issue Credential</Link>
              <a href={`https://testnet.explorer.nervos.org/transaction/${ct.txHash}`}
                target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                View on Explorer
              </a>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-end justify-between border-b border-[color:var(--border)] pb-5">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-main">Issued Credentials</h2>
              <span className="caption">{credentials.length}</span>
            </div>
            {credentials.length === 0 ? (
              <div className="surface-flat py-14 text-center text-muted">No credentials issued yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {credentials.map((c) => <CredentialCard key={c.sporeId} credential={c} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="caption mb-2">{label}</p>
      <p className="truncate font-mono text-xs text-muted">{value}</p>
    </div>
  );
}
