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
    <div className="surface p-6">
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
        <svg className="h-5 w-5 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>

      <h3 className="mb-2 line-clamp-1 text-lg font-semibold tracking-[-0.03em] text-main">
        {credential.content.name}
      </h3>
      <p className="mb-1 text-sm text-muted">
        Issued by <span className="font-medium text-main">{credential.content.issuer}</span>
      </p>
      <p className="mb-4 text-xs text-subtle">{credential.content.issuedAt}</p>

      {credential.content.description && (
        <p className="mb-6 line-clamp-2 text-sm leading-6 text-muted">{credential.content.description}</p>
      )}

      <div className="mb-4 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
        <Link href={`/credentials/${credential.sporeId}`}
          className="text-sm font-medium text-main hover:opacity-70">
          View on-chain -&gt;
        </Link>
        <span className="caption text-[11px]">
          Verified
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-2">
          <button onClick={onTransfer}
            className="btn-secondary flex-1 text-xs">
            Transfer
          </button>
          <button onClick={onMelt} disabled={melting}
            className="btn-secondary flex-1 text-xs disabled:opacity-40">
            {melting ? "Melting..." : "Melt"}
          </button>
        </div>
      )}
    </div>
  );
}
