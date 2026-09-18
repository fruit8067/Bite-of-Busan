import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";

export function createHmac(_algorithm: string, key: string) {
  let value = "";
  return {
    update(input: string) {
      value += input;
      return this;
    },
    digest(encoding: string) {
      if (encoding !== "hex") {
        throw new Error(`Unsupported digest encoding: ${encoding}`);
      }
      return Array.from(hmac(sha256, new TextEncoder().encode(key), new TextEncoder().encode(value)) as Uint8Array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    },
  };
}

export function timingSafeEqual(): boolean {
  return false;
}

export function createPublicKey(): never {
  throw new Error("createPublicKey is not supported in the Expo client.");
}

export function verify(): boolean {
  return false;
}