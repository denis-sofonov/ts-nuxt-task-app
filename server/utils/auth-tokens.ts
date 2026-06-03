import { randomBytes, createHash } from 'node:crypto'

type TokenType = 'email_verification' | 'password_reset'

const TTL_MS: Record<TokenType, number> = {
  email_verification: 1000 * 60 * 60 * 24, // 24 hours
  password_reset: 1000 * 60 * 30, // 30 minutes
}

// The raw token travels in the email link; only its hash is persisted, so the
// stored value is useless to an attacker who reads the database.
function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/** Issue a single-use token and return the raw value to embed in a link. */
export async function issueAuthToken(userId: string, type: TokenType): Promise<string> {
  const raw = randomBytes(32).toString('base64url')
  const db = useDb()

  // One active token of a kind per user keeps the table tidy and invalidates
  // any previously sent link.
  await db
    .delete(tables.authTokens)
    .where(and(eq(tables.authTokens.userId, userId), eq(tables.authTokens.type, type)))

  await db.insert(tables.authTokens).values({
    userId,
    type,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + TTL_MS[type]),
  })

  return raw
}

/**
 * Validate and consume a token. Returns the owning user id, or null when the
 * token is unknown, of the wrong type, or expired. Consumed tokens are deleted.
 */
export async function consumeAuthToken(raw: string, type: TokenType): Promise<string | null> {
  const db = useDb()

  const [token] = await db
    .delete(tables.authTokens)
    .where(and(eq(tables.authTokens.tokenHash, hashToken(raw)), eq(tables.authTokens.type, type)))
    .returning()

  if (!token || token.expiresAt.getTime() < Date.now()) {
    return null
  }
  return token.userId
}
