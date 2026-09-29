import type { FastifyInstance } from "fastify";
import { StudioService } from "./service";
import { buildRequestSchema, patchRequestSchema, planRequestSchema, studioError } from "./types";

export async function registerStudioRoutes(app: FastifyInstance, service: StudioService): Promise<void> {
  // This is a local workstation API. Protect it from drive-by web pages even
  // though the legacy GraphCode API retains its original CORS behavior.
  await app.register(async (studio) => {
    studio.addHook("preHandler", async (request) => {
      const origin = request.headers.origin;
      if (!origin) return;
      let allowed = false;
      try {
        const parsed = new URL(origin);
        allowed = ["http:", "https:"].includes(parsed.protocol) && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
      } catch { /* Reject malformed origins. */ }
      if ((process.env.SPROUT_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).includes(origin)) allowed = true;
      if (!allowed) throw studioError("工作台只接受本机页面，或服务端明确配置的页面来源。", 403);
    });
    studio.get("/status", async () => service.status());
    studio.get("/projects", async () => ({ projects: service.list() }));
    studio.post("/plan", async (request, reply) => {
      const project = await service.plan(planRequestSchema.parse(request.body));
      return reply.status(201).send(project);
    });
    studio.get<{ Params: { id: string } }>("/projects/:id", async (request) => service.get(request.params.id));
    studio.post<{ Params: { id: string } }>("/projects/:id/build", async (request) => service.build(request.params.id, buildRequestSchema.parse(request.body ?? {})));
    studio.patch<{ Params: { id: string } }>("/projects/:id", async (request) => service.patch(request.params.id, patchRequestSchema.parse(request.body)));
    studio.get<{ Params: { id: string }; Querystring: { format?: string } }>("/projects/:id/export", async (request, reply) => {
      const project = service.get(request.params.id);
      if (request.query.format === "json") {
        return reply.header("Content-Disposition", `attachment; filename="sprout-${project.id}.json"`).type("application/json").send(JSON.stringify(project, null, 2));
      }
      if (request.query.format && request.query.format !== "html") throw studioError("导出格式只能是 html 或 json。", 400);
      if (!project.html) throw studioError("先搭建一个模块，再导出作品。", 409);
      return reply.header("Content-Disposition", `attachment; filename="sprout-${project.id}.html"`).header("X-Content-Type-Options", "nosniff").type("text/html; charset=utf-8").send(project.html);
    });
  }, { prefix: "/api/studio" });
}
