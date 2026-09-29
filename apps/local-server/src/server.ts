import { fileURLToPath } from "node:url";
import path from "node:path";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { resolveAgentFeatureFlags, resolveDbPath, resolveRepoRoot, resolveServerHost, resolveServerPort, type AgentFeatureFlags } from "./config";
import { registerApiRoutes } from "./routes";
import { WorkspaceRuntime } from "./workspace";
import { registerStudioRoutes } from "./studio/routes";
import { StudioService } from "./studio/service";

export async function buildServer(options: { dbPath?: string; seedSelf?: boolean; selfRootPath?: string; agentFeatureFlags?: AgentFeatureFlags; studioDataPath?: string } = {}) {
  const runtime = new WorkspaceRuntime(
    options.dbPath ?? resolveDbPath(),
    options.selfRootPath ?? resolveRepoRoot(),
    options.agentFeatureFlags ?? resolveAgentFeatureFlags()
  );
  if (options.seedSelf) {
    runtime.seedSelfGraph();
  }

  const app = Fastify({
    logger: process.env.NODE_ENV === "test" ? false : { level: process.env.LOG_LEVEL ?? "info" }
  });

  await app.register(cors, {
    origin: true
  });

  app.setErrorHandler((error, _request, reply) => {
    const caughtError = error as Error & { statusCode?: number };
    const zodError = caughtError instanceof ZodError ? caughtError : null;
    const statusCode = zodError ? 400 : typeof caughtError.statusCode === "number" ? caughtError.statusCode : 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? "Internal Server Error" : "Request Error",
      message: zodError
        ? `Invalid request: ${zodError.issues.slice(0, 5).map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`).join(" ")}`
        : caughtError.message
    });
  });

  await registerApiRoutes(app, runtime);
  await registerStudioRoutes(app, new StudioService(options.studioDataPath ?? process.env.SPROUT_DATA_PATH ?? path.join(resolveRepoRoot(), ".graphcode", "studio")));

  app.addHook("onClose", async () => {
    runtime.close();
  });



  return app;
}

function formatIssuePath(path: Array<string | number>): string {
  if (path.length === 0) return "request";
  return path.reduce<string>((formatted, segment) => {
    if (typeof segment === "number") return `${formatted}[${segment}]`;
    return formatted ? `${formatted}.${segment}` : segment;
  }, "");
}

async function main(): Promise<void> {
  const port = resolveServerPort();
  const host = resolveServerHost();
  const app = await buildServer();
  await app.listen({ port, host });

  const close = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
