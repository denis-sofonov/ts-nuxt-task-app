import { hash, verify } from '@node-rs/argon2'

// Argon2id (the library default algorithm) tuned to the OWASP baseline
// (m = 19 MiB, t = 2, p = 1). Parameters are embedded in the resulting hash
// string, so verification reads them back and old hashes keep verifying if
// these defaults are tuned later.
const options = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

// Named distinctly from nuxt-auth-utils' built-in scrypt helpers (which we
// intentionally do not use) to avoid an auto-import collision.
export function hashUserPassword(password: string): Promise<string> {
  return hash(password, options)
}

export function verifyUserPassword(storedHash: string, password: string): Promise<boolean> {
  return verify(storedHash, password)
}
