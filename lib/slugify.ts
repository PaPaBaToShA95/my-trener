const FROM = /[\s_]+/g;
const INVALID = /[^\p{Letter}\p{Number}-]/gu;
const MULTIPLE_DASHES = /--+/g;
const EDGE_DASHES = /^-+|-+$/g;

function createFallback(value: string): string {
  const encoded = Array.from(value.trim())
    .map((char) => {
      const code = char.codePointAt(0);
      return code ? code.toString(36) : "";
    })
    .filter(Boolean)
    .join("");

  return encoded ? `id-${encoded}` : "id";
}

export function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .trim()
    .replace(FROM, "-")
    .replace(INVALID, "")
    .replace(MULTIPLE_DASHES, "-")
    .replace(EDGE_DASHES, "");

  return normalized || createFallback(value);
}
