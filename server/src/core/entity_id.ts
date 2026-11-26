/** New primary-key string ids (RFC 4122 UUID v4). */
export function newEntityId(): string {
  return crypto.randomUUID()
}