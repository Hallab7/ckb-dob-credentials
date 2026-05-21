import assert from "node:assert/strict";
import test from "node:test";
import {
  CREDENTIAL_CONTENT_TYPE,
  CREDENTIAL_SCHEMA,
  decodeContent,
  encodeContent,
  isCredentialContent,
} from "../lib/types.ts";

test("credential content encodes with app schema marker", () => {
  const decoded = decodeContent(
    encodeContent({
      name: "CKBuilder Week 1",
      issuedAt: "2026-05-21",
      issuer: "CKBuilder",
    })
  );

  assert.equal(CREDENTIAL_CONTENT_TYPE, "application/vnd.dob-credentials+json");
  assert.equal(decoded.schema, CREDENTIAL_SCHEMA);
  assert.equal(decoded.name, "CKBuilder Week 1");
  assert.equal(isCredentialContent(decoded), true);
});

test("credential validation rejects generic json spore content", () => {
  assert.equal(
    isCredentialContent({
      name: "Not enough",
      issuedAt: "2026-05-21",
      issuer: "Someone",
    }),
    false
  );
});
