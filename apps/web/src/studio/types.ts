export type Provider = "demo" | "codex" | "api";
export type Template = "star-catcher" | "pet-care" | "focus-timer";
export interface Module {
  id: string;
  title: string;
  description: string;
  files: string[];
  dependsOn: string[];
  concept: string;
  challenge: string;
  status: "ready" | "done";
  source: string;
}
export interface Project {
  id: string;
  title: string;
  prompt: string;
  template: Template;
  provider: Provider;
  modules: Module[];
  html: string | null;
  config: {
    accent: string;
    speed: number;
    target: number;
    durationMinutes: number;
    petName: string;
  };
  activity: { id: string; at: string; kind: string; message: string }[];
  createdAt: string;
  updatedAt: string;
}
export interface Status {
  providers: {
    id: Provider;
    available: boolean;
    label: string;
    detail: string;
  }[];
  defaultProvider: Provider;
}
export async function request<T>(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api/studio' + path, {
      signal: AbortSignal.timeout(210_000),
      ...(body === undefined ? {} : {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new Error('连接暂时中断。请确认本地服务仍在运行，再试一次。');
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('芽芽没有收到完整回复。稍等一下再试，已保存的作品还在。'); }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || '连接暂时中断，请再试一次。');
  }
  return data as T;
}
