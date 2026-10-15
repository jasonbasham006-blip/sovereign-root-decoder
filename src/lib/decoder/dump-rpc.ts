import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Manifest = z.object({
  id: z.string().max(80).regex(/^[\w-]+$/),
  name: z.string().max(200),
  mime: z.string().max(120),
  source: z.enum(["file", "paste", "camera"]),
  sha256: z.string().length(64),
  size: z.number().int().nonnegative(),
  created: z.string().max(40),
  status: z.enum(["queued", "processed", "blocked", "oversized"]),
  text: z.string().max(200_000).optional(),
  notes: z.array(z.string()).max(20).optional(),
  integers: z.array(z.number()).max(40).optional(),
  gate: z.string().max(40).optional(),
});

export const pushDumpItem = createServerFn({ method: "POST" })
  .validator((input: unknown) => Manifest.parse(input))
  .handler(async ({ data }) => {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const inbox = path.join(process.cwd(), "dump", "inbox");
    await mkdir(inbox, { recursive: true });
    await writeFile(path.join(inbox, `${data.id}.json`), `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return { ok: true as const, id: data.id };
  });
