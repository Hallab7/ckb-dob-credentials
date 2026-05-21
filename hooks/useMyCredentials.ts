"use client";
import { useState, useEffect } from "react";
import { useCcc } from "@ckb-ccc/connector-react";
import { Credential, CredentialType } from "@/lib/types";
import { getMyCredentials, getMyCredentialTypes } from "@/lib/indexer";

export function useMyCredentials() {
  const { signerInfo } = useCcc();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!signerInfo?.signer) {
      setCredentials([]);
      setCredentialTypes([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [creds, types] = await Promise.all([
        getMyCredentials(signerInfo.signer),
        getMyCredentialTypes(signerInfo.signer),
      ]);
      setCredentials(creds);
      setCredentialTypes(types);
    } catch {
      setError("Failed to load credentials from chain.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [signerInfo]);

  return { credentials, credentialTypes, loading, error, refetch: load };
}
