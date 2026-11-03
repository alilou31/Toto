/** Only a position is carried through navigation; member records are never persisted. */
export function discoveryPosition(value: string | null): number {
  if (!value || !/^\d{1,2}$/.test(value)) return 0;
  const position = Number(value);
  return position < 50 ? position : 0;
}

export function discoveryReturnHref(search: string): string {
  const params = new URLSearchParams(search);
  return params.get("retour") === "immersif"
    ? `/decouvrir/immersif?position=${discoveryPosition(params.get("position"))}`
    : "/decouvrir";
}

export function discoveryPhotoSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
