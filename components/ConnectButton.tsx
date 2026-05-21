"use client";
import { useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const { open, disconnect, signerInfo } = useCcc();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!signerInfo?.signer) { setAddress(null); return; }
    signerInfo.signer.getRecommendedAddress().then(setAddress).catch(() => setAddress(null));
  }, [signerInfo]);

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[color:var(--text)]" />
        <span className="hidden font-mono text-sm text-muted sm:block">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
        <button onClick={disconnect} className="btn-quiet">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={open}
      className="btn-primary min-h-11 px-5">
      Connect Wallet
    </button>
  );
}
