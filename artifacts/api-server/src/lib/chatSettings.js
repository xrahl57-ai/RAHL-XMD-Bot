/**
 * Chat Settings — RAHL XMD
 *
 * Anti-delete is globally ON for all chats — no per-chat toggle needed.
 * setAntiDelete / getAntiDelete kept for any legacy imports but effectively no-ops.
 */

export async function getAntiDelete() {
  return true; // always on globally
}

export async function setAntiDelete() {
  // no-op — anti-delete is always on
}
