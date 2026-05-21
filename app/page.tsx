"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CredentialTypeCard } from "@/components/CredentialTypeCard";
import { getAllCredentialTypes } from "@/lib/indexer";
import { CredentialType } from "@/lib/types";

export default function Home() {
  const [types, setTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCredentialTypes(6).then(setTypes).catch(() => setTypes([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 mb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Powered by Spore Protocol on CKB
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          On-chain Verifiable Credentials
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
          Issue and hold credentials as Spore DOBs. Each credential is a cell you own,
          backed by CKB, verifiable by anyone.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/issue"
            className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700">
            Issue Credentials
          </Link>
          <Link href="/verify"
            className="bg-white text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400">
            Verify an Address
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          { step: "1", title: "Create a Credential Type", desc: "Define a credential schema as a Spore Cluster. One cluster per credential type." },
          { step: "2", title: "Issue to Recipients", desc: "Mint a Spore DOB to any CKB address. The recipient owns the cell — not you." },
          { step: "3", title: "Verify On-chain", desc: "Anyone can verify credentials by reading cells directly from the CKB blockchain." },
        ].map((item) => (
          <div key={item.step} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mb-3">
              {item.step}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent credential types */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Recent Credential Types</h2>
        <Link href="/explore" className="text-sm text-indigo-600 hover:text-indigo-800">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-100 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-full mb-1" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm">No credential types yet.</p>
          <Link href="/issue" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((ct) => <CredentialTypeCard key={ct.clusterId} ct={ct} />)}
        </div>
      )}
    </div>
  );
}
