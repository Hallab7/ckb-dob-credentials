import Link from "next/link";
import { CredentialType } from "@/lib/types";

export function CredentialTypeCard({
  ct,
  href,
}: {
  ct: CredentialType;
  href?: string;
}) {
  const target = href ?? `/explore/${ct.clusterId}`;
  return (
    <Link href={target}>
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
          <span className="text-indigo-600 text-lg font-bold">{ct.name.charAt(0)}</span>
        </div>
        <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 line-clamp-1">
          {ct.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-3">{ct.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono truncate max-w-32">
            {ct.issuerAddress.slice(0, 12)}...
          </span>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            Cluster
          </span>
        </div>
      </div>
    </Link>
  );
}
