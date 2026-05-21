import Link from "next/link";
import { Credential } from "@/lib/types";

export function CredentialCard({
  credential,
  showActions,
  onMelt,
  onTransfer,
  melting,
}: {
  credential: Credential;
  showActions?: boolean;
  onMelt?: () => void;
  onTransfer?: () => void;
  melting?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {/* Badge icon */}
      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>

      <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">
        {credential.content.name}
      </h3>
      <p className="text-xs text-slate-500 mb-1">
        Issued by <span className="font-medium text-slate-700">{credential.content.issuer}</span>
      </p>
      <p className="text-xs text-slate-400 mb-3">{credential.content.issuedAt}</p>

      {credential.content.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{credential.content.description}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <Link href={`/credentials/${credential.sporeId}`}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          View on-chain →
        </Link>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
          Verified
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button onClick={onTransfer}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            Transfer
          </button>
          <button onClick={onMelt} disabled={melting}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40">
            {melting ? "Melting..." : "Melt"}
          </button>
        </div>
      )}
    </div>
  );
}
