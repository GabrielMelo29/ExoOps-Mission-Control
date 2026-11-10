import "server-only";

import { z } from "zod";

/**
 * Variáveis SOMENTE de servidor. O `server-only` quebra o build se este módulo
 * for importado por um componente client.
 *
 * A validação é preguiçosa (primeiro uso) para não derrubar `next build` em
 * ambientes sem segredos, como o CI de lint e typecheck.
 */
const serverEnvSchema = z.object({
  NASA_API_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) {
    return cached;
  }

  const result = serverEnvSchema.safeParse({
    NASA_API_KEY: process.env.NASA_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!result.success) {
    const details = z.prettifyError(result.error);
    throw new Error(
      `Variáveis de ambiente do servidor inválidas. Consulte .env.example.\n${details}`,
    );
  }

  cached = result.data;
  return cached;
}
