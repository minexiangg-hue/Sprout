import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { registerStudioRoutes } from "./routes";
import { StudioModels } from "./provider";
import { assembleHtml, StudioService } from "./service";
import { demoModules } from "./templates";
import type { StudioTemplate } from "./types";

const temporaryDirectories: string[] = [];
function directory() { const value = fs.mkdtempSync(path.join(os.tmpdir(), "sprout-test-")); temporaryDirectories.push(value); return value; }
afterEach(() => { for (const value of temporaryDirectories.splice(0)) fs.rmSync(value, { recursive: true, force: true }); });

describe("Sprout studio projects", () => {
  it.each<StudioTemplate>(["star-catcher", "pet-care", "focus-timer"])("builds, persists and edits the %s template module by module", async (template) => {
    const location = directory(), service = new StudioService(location);
    let project = await service.plan({ prompt: "做一个可以玩的作品", template, provider: "demo" });
    expect(project.html).toBeNull();
    expect(project.activity[0].message).toContain("未调用 AI");
    await expect(service.build(project.id, { moduleId: "logic" })).rejects.toMatchObject({ statusCode: 409 });
    for (let count = 1; count <= 4; count++) {
      project = await service.build(project.id, {});
      expect(project.modules.filter((item) => item.status === "done")).toHaveLength(count);
      expect(project.html).toContain(project.modules[count - 1].files[0]);
    }
    expect(project.html).toContain("Content-Security-Policy");
    expect(project.html).toContain("sprout:success");
    project = service.patch(project.id, { config: { accent: "#ff0000", target: 7, durationMinutes: 2, petName: "团团" }, title: "我的作品" });
    expect(project.html).toContain('"target":7');
    expect(project.html).toContain("--accent:#ff0000");
    expect(new StudioService(location).get(project.id)).toEqual(project);
    expect(service.list()).toHaveLength(1);
    await expect(service.build(project.id, { moduleId: "logic", instruction: "改成飞船" })).rejects.toMatchObject({ statusCode: 400 });
  });

  it("validates model plans and preserves the last working source on generation failure", async () => {
    let response = JSON.stringify({ title: "月球计时器", modules: demoModules("focus-timer") });
    const service = new StudioService(directory(), { invoke: async () => response });
    let project = await service.plan({ prompt: "倒计时结束让火箭起飞", template: "focus-timer", provider: "api" });
    expect(project.title).toBe("月球计时器");
    response = JSON.stringify({ source: '<main><h1>月球基地</h1><button id="launch">发射</button></main>', explanation: "月球舞台搭好了。" });
    project = await service.build(project.id, {});
    expect(project.html).toContain("月球基地");
    const before = service.get(project.id);
    response = JSON.stringify({ source: '<script>fetch("https://example.com")</script>', explanation: "bad" });
    await expect(service.build(project.id, { moduleId: "scene", instruction: "调整画面" })).rejects.toMatchObject({ statusCode: 422 });
    expect(service.get(project.id)).toEqual(before);
    response = JSON.stringify({ title: "bad", modules: demoModules("focus-timer").map((module, index) => index === 0 ? { ...module, files: ["../escape.html"] } : module) });
    await expect(service.plan({ prompt: "invalid filename", template: "focus-timer", provider: "api" })).rejects.toMatchObject({ statusCode: 422 });
    response = JSON.stringify({ title: "bad", modules: demoModules("focus-timer").map((module, index) => index === 0 ? { ...module, dependsOn: ["logic"] } : module) });
    await expect(service.plan({ prompt: "invalid dependencies", template: "focus-timer", provider: "api" })).rejects.toMatchObject({ statusCode: 422 });
  });

  it("rejects simultaneous builds so a slow model cannot overwrite a newer edit", async () => {
    let complete: (value: string) => void = () => {};
    let phase = "plan";
    const service = new StudioService(directory(), { invoke: async () => phase === "plan" ? JSON.stringify({ title: "并发测试", modules: demoModules("star-catcher") }) : new Promise((resolve) => { complete = resolve; }) });
    const project = await service.plan({ prompt: "测试并发", template: "star-catcher", provider: "codex" });
    phase = "build";
    const pending = service.build(project.id, {});
    await expect(service.build(project.id, {})).rejects.toMatchObject({ statusCode: 409 });
    expect(() => service.patch(project.id, { title: "conflicting" })).toThrow("正在生成");
    complete(JSON.stringify({ source: "<main>One</main>", explanation: "done" }));
    await pending;
    expect(service.get(project.id).modules[0].status).toBe("done");
  });

  it("confines IDs, rejects symlink reads and prevents config from breaking out of a script", async () => {
    const location = directory(), service = new StudioService(location);
    expect(() => service.get("../../secret")).toThrow("编号无效");
    let project = await service.plan({ prompt: "测试转义", template: "pet-care", provider: "demo" });
    project = await service.build(project.id, {});
    project = service.patch(project.id, { config: { petName: "</script><script>" } });
    expect(assembleHtml(project)).toContain("\\u003c/script>");
    fs.unlinkSync(path.join(location, `${project.id}.json`));
    fs.symlinkSync(path.join(location, "not-a-project"), path.join(location, `${project.id}.json`));
    expect(() => service.get(project.id)).toThrow();
  });

  it("uses the external OpenAI-compatible API contract with server-only credentials", async () => {
    let received: unknown, authorization: string | undefined;
    const server = createServer(async (req, res) => {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      received = JSON.parse(Buffer.concat(chunks).toString()); authorization = req.headers.authorization;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    try {
      if (!address || typeof address === "string") throw new Error("Missing local server port");
      const models = new StudioModels({ SPROUT_API_KEY: "test-only-key", SPROUT_MODEL: "test-model", SPROUT_API_BASE: `http://127.0.0.1:${address.port}/v1` });
      expect(await models.invoke({ provider: "api", system: "System", prompt: "Hello" })).toBe('{"ok":true}');
      expect(authorization).toBe("Bearer test-only-key");
      expect(received).toMatchObject({ model: "test-model", messages: [{ role: "system", content: "System" }, { role: "user", content: "Hello" }] });
    } finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
  });

  it("validates the HTTP boundary, exports projects and blocks untrusted origins", async () => {
    const app = Fastify();
    app.setErrorHandler((error, _request, reply) => reply.status(error instanceof ZodError ? 400 : (error as { statusCode?: number }).statusCode || 500).send({ message: (error as Error).message }));
    await registerStudioRoutes(app, new StudioService(directory()));
    try {
      const invalid = await app.inject({ method: "POST", url: "/api/studio/plan", payload: { prompt: "x", template: "unknown" } });
      expect(invalid.statusCode).toBe(400);
      const remote = await app.inject({ method: "GET", url: "/api/studio/projects", headers: { origin: "https://untrusted.example" } });
      expect(remote.statusCode).toBe(403);
      const plan = await app.inject({ method: "POST", url: "/api/studio/plan", payload: { prompt: "我的星星游戏", template: "star-catcher", provider: "demo" } });
      expect(plan.statusCode).toBe(201);
      const id = plan.json().id;
      expect((await app.inject({ url: `/api/studio/projects/${id}/export` })).statusCode).toBe(409);
      expect((await app.inject({ method: "POST", url: `/api/studio/projects/${id}/build`, payload: {} })).statusCode).toBe(200);
      const exported = await app.inject({ url: `/api/studio/projects/${id}/export` });
      expect(exported.headers["content-disposition"]).toContain("attachment;");
      expect(exported.body).toContain("<!doctype html>");
      expect((await app.inject({ url: `/api/studio/projects/${id}/export?format=json` })).json().modules[0].source).toContain("canvas");
      expect((await app.inject({ method: "PATCH", url: `/api/studio/projects/${id}`, payload: { config: { speed: 100 } } })).statusCode).toBe(400);
      expect((await app.inject({ method: "GET", url: "/api/studio/projects", headers: { origin: "http://localhost:5173" } })).json().projects).toHaveLength(1);
    } finally { await app.close(); }
  });
});
