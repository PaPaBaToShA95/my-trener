const FROM = /[\s_]+/g;
const INVALID = /[^a-z0-9-]/g;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(FROM, "-")
    .replace(INVALID, "")
    .replace(/--+/g, "-");
}
