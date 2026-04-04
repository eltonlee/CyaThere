const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(size = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}
