import { z } from "zod";

export const templateSchema = z.enum(["star-catcher", "pet-care", "focus-timer"]);
export const providerSchema = z.enum(["demo", "codex", "api"]);
export const configSchema = z.object({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ffbb54"),
  speed: z.number().min(0.5).max(5).default(1),
  target: z.number().int().min(3).max(50).default(10),
  durationMinutes: z.number().int().min(1).max(60).default(5),
  petName: z.string().trim().min(1).max(24).default("芽芽")
});
export const moduleSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(400),
  files: z.array(z.string().regex(/^[a-zA-Z0-9_-]+\.(html|css|js)$/)).min(1).max(1),
  dependsOn: z.array(z.string()).max(6),
  kind: z.enum(["html", "css", "js"]),
  concept: z.string().min(1).max(180),
  challenge: z.string().min(1).max(240),
  status: z.enum(["ready", "done"]).default("ready"),
  source: z.string().max(100_000).default("")
});
export const activitySchema = z.object({
  id: z.string(), at: z.string(), kind: z.enum(["plan", "build", "edit"]), message: z.string()
});
export const projectSchema = z.object({
  id: z.string().uuid(), title: z.string().min(1).max(60), prompt: z.string().min(1).max(4000),
  template: templateSchema, provider: providerSchema,
  modules: z.array(moduleSchema).min(3).max(6),
  config: configSchema, activity: z.array(activitySchema),
  html: z.string().nullable(), createdAt: z.string(), updatedAt: z.string()
});
export const planRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(4000), template: templateSchema, provider: providerSchema.default("demo")
}).strict();
export const buildRequestSchema = z.object({
  moduleId: z.string().max(40).optional(), instruction: z.string().trim().min(1).max(2000).optional()
}).strict();
export const patchRequestSchema = z.object({
  title: z.string().trim().min(1).max(60).optional(), config: configSchema.partial().strict().optional()
}).strict();
export const generatedPlanSchema = z.object({
  title: z.string().min(1).max(60), modules: z.array(moduleSchema.omit({ source: true, status: true })).min(3).max(6)
});
export type StudioProject = z.infer<typeof projectSchema>;
export type StudioModule = z.infer<typeof moduleSchema>;
export type StudioConfig = z.infer<typeof configSchema>;
export type StudioTemplate = z.infer<typeof templateSchema>;
export type StudioProvider = z.infer<typeof providerSchema>;
export type PlanRequest = z.infer<typeof planRequestSchema>;
export type BuildRequest = z.infer<typeof buildRequestSchema>;
export type PatchRequest = z.infer<typeof patchRequestSchema>;

export function studioError(message: string, statusCode = 400): Error & { statusCode: number } {
  return Object.assign(new Error(message), { statusCode });
}

export function validateModules(modules: StudioModule[]): void {
  const seen = new Set<string>();
  const files = new Set<string>();
  for (const module of modules) {
    if (seen.has(module.id) || module.dependsOn.some((id) => !seen.has(id))) {
      throw studioError("模块依赖必须指向前面的模块，且不能重复或形成循环。", 422);
    }
    for (const file of module.files) {
      if (files.has(file) || !file.endsWith(`.${module.kind}`)) throw studioError("每个模块必须对应独立、类型正确的源码文件。", 422);
      files.add(file);
    }
    seen.add(module.id);
  }
  if (!modules.some((module) => module.kind === "html") || !modules.some((module) => module.kind === "js")) {
    throw studioError("项目需要画面 HTML 和交互 JavaScript 模块。", 422);
  }
}
