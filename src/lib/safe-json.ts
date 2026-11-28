/**
 * JSON for embedding inside <script type="application/json">. Escapes the
 * characters that could end the script element or start markup, so data that
 * originated from the store can never break out into the page.
 */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
