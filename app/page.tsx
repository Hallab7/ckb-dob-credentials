"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { getAllCredentialTypes, getMyCredentialTypes } from "@/lib/indexer";
import { CredentialType } from "@/lib/types";

const steps = [
  { step: "01", title: "Define", desc: "Create a Spore Cluster that acts as the credential type and schema anchor." },
  { step: "02", title: "Issue", desc: "Mint a credential DOB to any CKB address. The recipient owns the cell." },
  { step: "03", title: "Verify", desc: "Read cells directly from CKB testnet to verify ownership and credential content." },
];

export default function Home() {
  const { signerInfo } = useCcc();
  const [types, setTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setTypes([...mine, ...others].slice(0, 6));
      } catch {
        setTypes([]);
        setError("Failed to load credential types from CKB testnet.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [signerInfo]);

  return (
    <div className="space-y-28 lg:space-y-36">
      <section className="grid min-h-[calc(100vh-180px)] items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="caption mb-8">Spore credentials on CKB</p>
          <h1 className="hero-title text-main">
            Verifiable credentials with on-chain ownership.
          </h1>
        </div>
        <div className="lg:col-span-4 lg:self-end">
          <p className="body-copy max-w-xl">
            CredSpore turns credential types into Spore Clusters and issued credentials
            into holder-owned DOB cells. Minimal surface, permanent verification.
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link href="/issue" className="btn btn-primary h-[58px] px-7">
              Issue Credentials
            </Link>
            <Link href="/verify" className="btn btn-secondary h-[58px] px-7">
              Verify Address
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-y border-[color:var(--border)] py-8 md:grid-cols-3">
        {[
          { label: "Network", value: "Testnet" },
          { label: "Protocol", value: "Spore" },
          { label: "Model", value: "Cell-owned" },
        ].map((item) => (
          <div key={item.label} className="py-4">
            <p className="caption mb-3">{item.label}</p>
            <p className="section-title text-main">{item.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="caption mb-5">Workflow</p>
            <h2 className="section-title text-main">A compact issuance system.</h2>
          </div>
          <p className="body-copy lg:col-span-5 lg:col-start-8">
            Every workflow is intentionally direct: define a credential type, issue it
            to a holder, then verify it from chain state.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="surface p-7">
              <p className="caption mb-10">{item.step}</p>
              <h3 className="mb-3 text-2xl font-semibold tracking-[-0.04em] text-main">{item.title}</h3>
              <p className="text-sm leading-7 text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="caption mb-5">Recent types</p>
            <h2 className="section-title text-main">Credential clusters.</h2>
          </div>
          <Link href="/explore" className="btn btn-secondary">
            View all
          </Link>
        </div>

        {error ? (
          <div className="surface-flat p-8 text-muted">{error}</div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="surface h-56 animate-pulse" />
            ))}
          </div>
        ) : types.length === 0 ? (
          <div className="surface-flat p-10 text-center">
            <p className="text-muted">No credential types yet.</p>
            <Link href="/issue" className="mt-5 inline-flex btn btn-primary">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {types.map((ct) => <CredentialTypeCard key={ct.clusterId} ct={ct} />)}
          </div>
        )}
      </section>
    </div>
  );
}
