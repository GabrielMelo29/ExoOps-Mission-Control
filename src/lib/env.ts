import { z } from "zod";

/**
 * Variáveis PÚBLICAS (embutidas no bundle do cliente). Seguro importar em
 * qualquer lugar. Segredos ficam em `env.server.ts`, nunca aqui.
 *
 * O Next só substitui `process.env.NEXT_PUBLIC_*` quando o acesso é estático,
 * por isso cada chave é lida explicitamente (sem `process.env` inteiro).
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function parsePublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    const details = z.prettifyError(result.error);
    throw new Error(
      `Variáveis de ambiente públicas inválidas. Consulte .env.example.\n${details}`,
    );
  }

  return result.data;
}

export const publicEnv: PublicEnv = parsePublicEnv();
