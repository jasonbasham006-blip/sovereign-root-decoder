export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  const rec = value as Record<string, unknown>;
  const keys = Object.keys(rec).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(rec[k])}`).join(",")}}`;
}

function hexOf(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return hexOf(new Uint8Array(digest));
}

export async function sha256Raw(data: Uint8Array): Promise<Uint8Array> {
  const copy = Uint8Array.from(data);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return new Uint8Array(digest);
}

/** BIP-340 tagged hash. Public commitment primitive — not a signing oracle. */
export async function taggedHash(tag: string, msg: Uint8Array): Promise<Uint8Array> {
  const tagHash = await sha256Raw(new TextEncoder().encode(tag));
  const cat = new Uint8Array(tagHash.length * 2 + msg.length);
  cat.set(tagHash, 0);
  cat.set(tagHash, tagHash.length);
  cat.set(msg, tagHash.length * 2);
  return sha256Raw(cat);
}

export function bytesToHex(bytes: Uint8Array): string {
  return hexOf(bytes);
}
