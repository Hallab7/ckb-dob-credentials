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
      <div className="surface group cursor-pointer p-6 hover:-translate-y-0.5 hover:shadow-[var(--shadow-medium)]">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
          <span className="text-lg font-semibold text-main">{ct.name.charAt(0)}</span>
        </div>
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold tracking-[-0.03em] text-main">
          {ct.name}
        </h3>
        <p className="mb-8 line-clamp-2 text-sm leading-6 text-muted">{ct.description}</p>
        <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-4">
          <span className="max-w-32 truncate font-mono text-xs text-subtle">
            {ct.issuerAddress.slice(0, 12)}...
          </span>
          <span className="caption text-[11px]">
            Cluster
          </span>
        </div>
      </div>
    </Link>
  );
}
