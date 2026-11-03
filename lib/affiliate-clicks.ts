type ClickValidation = { ideaId: string } | { status: number };

/** Validate a minimal anonymous event; no URL, profile or identity is accepted. */
export async function validateAffiliateClick(
  request: Request,
  offers: readonly { ideaId: string }[],
  enabled = false,
): Promise<ClickValidation> {
  if (!enabled) return { status: 404 };
  if (request.headers.get("origin") !== new URL(request.url).origin) return { status: 403 };
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return { status: 415 };
  if (Number(request.headers.get("content-length")) > 512) return { status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { status: 400 };
  let size = 0;
  let body = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512) {
        await reader.cancel();
        return { status: 413 };
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    const event: unknown = JSON.parse(body);
    if (!event || typeof event !== "object" || Array.isArray(event)) return { status: 400 };
    const data = event as Record<string, unknown>;
    if (Object.keys(data).length !== 1 || typeof data.ideaId !== "string") return { status: 400 };
    if (!offers.some(offer => offer.ideaId === data.ideaId)) return { status: 404 };
    return { ideaId: data.ideaId };
  } catch {
    return { status: 400 };
  } finally {
    reader.releaseLock();
  }
}
