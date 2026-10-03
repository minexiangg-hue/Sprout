import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  FileCode2,
  FolderOpen,
  Gamepad2,
  Heart,
  Layers3,
  Leaf,
  Lightbulb,
  LoaderCircle,
  Maximize2,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Sprout,
  Timer,
  WandSparkles,
  X,
} from "lucide-react";
import { Mascot } from "./Mascot";
import {
  request,
  type Module,
  type Project,
  type Provider,
  type Status,
  type Template,
} from "./types";
import "./studio.css";
import { loadPreviewFont, previewDocument, type PreviewFont } from "./preview";
const templates: {
  id: Template;
  title: string;
  category: string;
  description: string;
  prompt: string;
  color: string;
  icon: typeof Gamepad2;
}[] = [
  {
    id: "star-catcher",
    title: "把星星装进口袋",
    category: "小游戏",
    description: "左右移动，接住一整片星空。",
    prompt: "我想做一个接星星小游戏，有计分、音效和挑战目标。",
    color: "violet",
    icon: Gamepad2,
  },
  {
    id: "pet-care",
    title: "领养一只小伙伴",
    category: "互动玩具",
    description: "喂食、玩耍，照顾你的电子宠物。",
    prompt: "我想养一只叫芽芽的电子宠物，可以喂食、陪它玩，看它心情变化。",
    color: "peach",
    icon: Heart,
  },
  {
    id: "focus-timer",
    title: "给专注一点魔法",
    category: "生活小工具",
    description: "做个属于自己的专注计时器。",
    prompt: "我想做一个绿色的专注计时器，可以开始、暂停和重置。",
    color: "green",
    icon: Timer,
  },
];
function ProjectArt({ type }: { type: Template }) {
  if (type === "star-catcher")
    return (
      <div className="template-art stars">
        <span className="pixel-star s1">✦</span>
        <span className="pixel-star s2">✦</span>
        <span className="pixel-star s3">✧</span>
        <span className="pixel-star s4">✦</span>
        <div className="little-basket">
          <span>•‿•</span>
        </div>
        <span className="art-score">★ 120</span>
        <span className="art-cloud" />
      </div>
    );
  if (type === "pet-care")
    return (
      <div className="template-art pet">
        <div className="pet-heart">♥</div>
        <Mascot />
        <span className="pet-food">● ● ●</span>
        <div className="pet-level">
          <span />
        </div>
      </div>
    );
  return (
    <div className="template-art timer">
      <span className="timer-leaf">✳</span>
      <div className="timer-clock">
        <span>25:00</span>
        <small>一点点，也很棒。</small>
        <div>▶</div>
      </div>
      <span className="timer-dot" />
    </div>
  );
}
export default function Studio() {
  const [projects, setProjects] = useState<Project[]>([]),
    [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<Status | null>(null),
    [provider, setProvider] = useState<Provider>("demo");
  const [prompt, setPrompt] = useState(""),
    [template, setTemplate] = useState<Template>("star-catcher");
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [tab, setTab] = useState<"start" | "projects">("start");
  const [selected, setSelected] = useState<string | null>(null),
    [view, setView] = useState<"preview" | "code">("preview");
  const [settings, setSettings] = useState(false),
    [lesson, setLesson] = useState(false),
    [revision, setRevision] = useState(""),
    [navOpen, setNavOpen] = useState(false),
    [guideOpen, setGuideOpen] = useState(false);
  const [checked, setChecked] = useState(false),
    [previewKey, setPreviewKey] = useState(0),
    [full, setFull] = useState(false);
  const [reflection, setReflection] = useState("");
  const [previewFont, setPreviewFont] = useState<PreviewFont | null>(null);
  useEffect(() => {
    if (!project?.html || previewFont) return;
    let active = true;
    void loadPreviewFont().then(font => { if(active) setPreviewFont(font); }).catch(() => {});
    return () => { active = false; };
  }, [!!project?.html, previewFont]);
  const previewHtml = useMemo(() => project?.html ? previewDocument(project.html, previewFont) : '', [project?.html, previewFont]);

  const textarea = useRef<HTMLTextAreaElement>(null),
    dialog = useRef<HTMLElement>(null);
  const activeProjectId = useRef<string | null>(null),
    actionSequence = useRef(0),
    mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    const syncLocation = () => {
      const id = new URLSearchParams(location.hash.slice(1)).get("project");
      if (id && id !== activeProjectId.current) {
        activeProjectId.current = id;
        setProject(null);
        setSelected(null);
        void openProject(id);
      } else if (
        !id &&
        (location.hash === "" || location.hash === "#idea") &&
        activeProjectId.current !== null
      ) {
        activeProjectId.current = null;
        actionSequence.current++;
        setBusy("");
        setProject(null);
        setError("");
      }
    };
    window.addEventListener("hashchange", syncLocation);
    syncLocation();
    void Promise.all([
      request<Status>("/status"),
      request<{ projects: Project[] }>("/projects"),
    ])
      .then(([s, p]) => {
        if (active) {
          setStatus(s);
          setProjects(p.projects);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      mounted.current = false;
      actionSequence.current++;
      activeProjectId.current = null;
      window.removeEventListener("hashchange", syncLocation);
    };
  }, []);
  useEffect(() => {
    let saved: { checked?: boolean; reflection?: string } = {};
    try {
      if (project)
        saved =
          JSON.parse(
            localStorage.getItem(
              "sprout-reflection:" + project.id + ":" + project.updatedAt,
            ) || "{}",
          ) ?? {};
    } catch {
      /* Learning notes remain optional when browser storage is unavailable. */
    }
    setChecked(
      saved.checked === true &&
        project?.modules.every((module) => module.status === "done") === true,
    );
    setReflection(
      typeof saved.reflection === "string"
        ? saved.reflection.slice(0, 2000)
        : "",
    );
  }, [project?.id, project?.updatedAt]);
  useEffect(() => {
    if (!settings && !lesson) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const focusable = () =>
      Array.from(
        element?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ) ?? [],
      );
    (focusable()[0] ?? element)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSettings(false);
        setLesson(false);
      }
      if (event.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items.at(-1);
        if (!first) {
          event.preventDefault();
          element?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (previous?.isConnected) previous.focus();
    };
  }, [settings, lesson]);
  useEffect(() => {
    if (!navOpen && !guideOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        setGuideOpen(false);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [navOpen, guideOpen]);
  function saveLearning(nextChecked: boolean, nextReflection: string) {
    setChecked(nextChecked);
    setReflection(nextReflection);
    try {
      if (project)
        localStorage.setItem(
          "sprout-reflection:" + project.id + ":" + project.updatedAt,
          JSON.stringify({ checked: nextChecked, reflection: nextReflection }),
        );
    } catch {
      /* Keep the current note usable in memory. */
    }
  }
  const current =
    project?.modules.find((m) => m.id === selected) ?? project?.modules[0];
  const done = project?.modules.filter((m) => m.status === "done").length ?? 0;
  async function action<T>(
    label: string,
    fn: () => Promise<T>,
    apply: (data: T) => void,
  ) {
    const sequence = ++actionSequence.current;
    setBusy(label);
    setError("");
    try {
      const data = await fn();
      if (mounted.current && sequence === actionSequence.current) apply(data);
    } catch (e) {
      if (mounted.current && sequence === actionSequence.current)
        setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (mounted.current && sequence === actionSequence.current) setBusy("");
    }
  }
  function keep(p: Project) {
    activeProjectId.current = p.id;
    setProject(p);
    setProjects((old) => [p, ...old.filter((x) => x.id !== p.id)]);
    location.hash = "project=" + p.id;
  }
  async function openProject(id: string) {
    await action(
      "打开作品",
      () => request<Project>("/projects/" + encodeURIComponent(id)),
      (p) => {
        keep(p);
        setSelected(p.modules[0]?.id ?? null);
      },
    );
  }
  function home(next: "start" | "projects" = "start") {
    if (busy) return;
    activeProjectId.current = null;
    setProject(null);
    setTab(next);
    setError("");
    location.hash = "";
    if (next === "projects")
      void request<{ projects: Project[] }>("/projects")
        .then((data) => {
          if (mounted.current) setProjects(data.projects);
        })
        .catch((e) => {
          if (mounted.current) setError(e.message);
        });
  }
  async function create() {
    if (prompt.trim().length < 3) {
      textarea.current?.focus();
      return;
    }
    await action(
      provider === "demo"
        ? "正在拆解示例配方"
        : "芽芽正在和 AI 一起拆解你的想法",
      () => request<Project>("/plan", { prompt, template, provider }),
      (p) => {
        keep(p);
        setSelected(p.modules[0]?.id ?? null);
      },
    );
  }
  async function build(moduleId?: string, instruction?: string) {
    if (!project) return;
    await action(
      instruction ? "正在修改这个模块" : "正在搭建模块",
      () =>
        request<Project>("/projects/" + project.id + "/build", {
          ...(moduleId ? { moduleId } : {}),
          ...(instruction ? { instruction } : {}),
        }),
      (p) => {
        keep(p);
        setRevision("");
        setView("preview");
      },
    );
  }
  async function config(key: string, value: string | number) {
    if (!project) return;
    await action(
      "正在保存你的调整",
      () =>
        request<Project>(
          "/projects/" + project.id,
          { config: { ...project.config, [key]: value } },
          "PATCH",
        ),
      keep,
    );
  }
  async function download(format: "html" | "json") {
    if (!project) return;
    if (format === 'json') { window.location.href='/api/studio/projects/'+project.id+'/export?format=json'; return; }
    if (!project.html) return;
    await action('正在准备离线作品', async () => {
      const font = await loadPreviewFont();
      return previewDocument(project.html!, font);
    }, html => {
      const url=URL.createObjectURL(new Blob([html], {type:'text/html;charset=utf-8'}));
      const link=document.createElement('a'); link.href=url; link.download='sprout-'+project.id+'.html';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  const next = project?.modules.find(
    (m) =>
      m.status === "ready" &&
      m.dependsOn.every(
        (id) => project.modules.find((x) => x.id === id)?.status === "done",
      ),
  );
  return (
    <div className="sprout-app">
      <nav className="rail rail-left" aria-label="主导航">
        <button
          className="rail-toggle"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "收起导航" : "展开导航"}
          aria-expanded={navOpen}
        >
          <Menu size={20} />
        </button>
        <button className="rail-item" onClick={() => home()} aria-label="创作空间">
          <Sparkles size={20} />
        </button>
        <button
          className="rail-item"
          onClick={() => home("projects")}
          aria-label="我的作品"
        >
          <FolderOpen size={20} />
        </button>
        <button
          className="rail-item"
          onClick={() => setLesson(true)}
          aria-label="灵感小课堂"
        >
          <BookOpen size={20} />
        </button>
        <button
          className="rail-item"
          onClick={() => setSettings(true)}
          aria-label="创作设置"
        >
          <Settings2 size={20} />
        </button>
        <a className="rail-item" href="#expert" aria-label="GraphCode 专业模式">
          <Code2 size={20} />
        </a>
      </nav>
      {navOpen && (
        <aside className="studio-nav drawer">
          <button
            className="drawer-close"
            aria-label="收起导航"
            onClick={() => setNavOpen(false)}
          >
            <X size={18} />
          </button>
          <button
            className="studio-brand"
          onClick={() => home()}
          aria-label="芽芽工坊首页"
        >
          <span>
            <Sprout size={25} />
          </span>
          <div>
            sprout<span>芽芽工坊</span>
          </div>
        </button>
        <div className="nav-label">让想法长出来</div>
        <button
          className={
            "nav-item " + (!project && tab === "start" ? "active" : "")
          }
          onClick={() => home()}
        >
          <Sparkles size={19} /> 创作空间 <span>✦</span>
        </button>
        <button
          className={
            "nav-item " + (!project && tab === "projects" ? "active" : "")
          }
          onClick={() => home("projects")}
        >
          <FolderOpen size={19} /> 我的作品 <small>{projects.length}</small>
        </button>
        <button className="nav-item" onClick={() => setLesson(true)}>
          <BookOpen size={19} /> 灵感小课堂
        </button>
        <div className="nav-divider" />
        <div className="nav-label">最近的灵感</div>
        <div className="recent-list">
          {projects.slice(0, 4).map((p) => (
            <button
              key={p.id}
              disabled={!!busy}
              onClick={() => openProject(p.id)}
            >
              <span className={"recent-dot " + p.template} />
              <span>{p.title}</span>
              <ChevronRight size={13} />
            </button>
          ))}
          {!projects.length && (
            <p>
              你的第一个作品，
              <br />
              会从这里开始。
            </p>
          )}
        </div>
        <div className="nav-bottom">
          <div className="grow-card">
            <Leaf size={19} />
            <strong>
              每个创造者，都是从
              <br />
              一个小想法开始的。
            </strong>
            <span>按自己的节奏，慢慢来。</span>
          </div>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <Settings2 size={17} /> 创作设置
          </button>
          <a className="expert-link" href="#expert">
            <Code2 size={16} /> GraphCode 专业模式 <ExternalLink size={13} />
          </a>
          <div className="local-label">
            <span /> 本地创作 · 作品由你保管
          </div>
        </div>
          </aside>
        )}
      <div className="studio-body">
        <header className="studio-topbar">
          <div className="breadcrumb">
            <span>你的创意游乐场</span>
            {project && (
              <>
                <ChevronRight size={14} />
                <strong>{project.title}</strong>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <span className="mode-pill">
              <span />
              {(project?.provider ?? provider) === "demo"
                ? "示例配方模式"
                : "AI 创作模式"}
            </span>
            <button
              onClick={() => setLesson(true)}
              className="help-button"
              aria-label="创作帮助"
            >
              ?
            </button>
            <div className="avatar">创</div>
          </div>
        </header>
        {error && (
          <div className="studio-error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="关闭错误">
              <X size={16} />
            </button>
          </div>
        )}
        {!project ? (
          <main className="home-scroll">
            <div className="home-heading">
              <div>
                <h1>
                  {tab === "projects"
                    ? "我的灵感，正在生长。"
                    : "嗨，今天想创造点什么？"}
                </h1>
                <p>
                  {tab === "projects"
                    ? "每一个作品，都是你从想象迈向创造的一步。"
                    : "一个游戏、一位小伙伴，或一个让生活更有趣的小工具。"}
                </p>
              </div>
            </div>
            {tab === "start" && (
              <>
                <section className="idea-box" id="idea">
                  <div className="idea-box-title">
                    <span>
                      <WandSparkles size={19} /> 我的奇妙想法
                    </span>
                    <button
                      onClick={() => {
                        const t =
                          templates[
                            (templates.findIndex((t) => t.id === template) +
                              1) %
                              templates.length
                          ];
                        setTemplate(t.id);
                        setPrompt(t.prompt);
                      }}
                    >
                      给我一点灵感 <Sparkles size={14} />
                    </button>
                  </div>
                  <textarea
                    ref={textarea}
                    value={prompt}
                    maxLength={3000}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="比如：我想做一个接星星的游戏，接满 10 颗就赢了……"
                    aria-label="描述你的创作想法"
                  />
                  <div className="idea-box-bottom">
                    <div className="idea-options">
                      <select
                        aria-label="选择作品类型"
                        value={template}
                        onChange={(e) =>
                          setTemplate(e.target.value as Template)
                        }
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.category} · {t.title}
                          </option>
                        ))}
                      </select>
                      <button
                        className="provider-switch"
                        onClick={() => setSettings(true)}
                      >
                        {provider === "demo"
                          ? "示例配方"
                          : provider === "codex"
                            ? "Codex AI"
                            : "外部 API"}{" "}
                        <Settings2 size={13} />
                      </button>
                    </div>
                    <button
                      className="primary-button"
                      disabled={!!busy || prompt.trim().length < 3}
                      onClick={create}
                    >
                      {busy ? (
                        <LoaderCircle className="spin" size={17} />
                      ) : (
                        <Sparkles size={17} />
                      )}{" "}
                      {busy ? "正在拆解…" : "让想法发芽"}{" "}
                      {!busy && <ArrowRight size={17} />}
                    </button>
                  </div>
                  <p className="mode-hint">
                    {provider === "demo"
                      ? "示例模式使用预设配方。自由创意请在创作设置中连接 AI。"
                      : "AI 会读取你的创作描述并生成模块。请不要输入姓名、学校或联系方式。"}
                  </p>
                </section>

              </>
            )}
            {tab === "projects" && (
              <section className="saved-projects">
                <button className="new-project-card" onClick={() => home()}>
                  <Plus size={35} />
                  <strong>种下一个新想法</strong>
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    className="saved-card"
                    onClick={() => openProject(p.id)}
                    disabled={!!busy}
                  >
                    <ProjectArt type={p.template} />
                    <div>
                      <h3>{p.title}</h3>
                      <p>
                        {p.modules.filter((m) => m.status === "done").length}/
                        {p.modules.length} 块积木 ·{" "}
                        {p.provider === "demo" ? "示例配方" : "AI 创作"}
                      </p>
                      <span>
                        {new Date(p.updatedAt).toLocaleDateString("zh-CN")}{" "}
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </button>
                ))}
              </section>
            )}
            <footer className="home-footer">
              <Sprout size={16} /> 好奇心是你最棒的超能力。
            </footer>
          </main>
        ) : (
          <main className="project-scroll">
            <div className="project-heading">
              <div>
                <button
                  className="text-button"
                  onClick={() => home("projects")}
                >
                  <ArrowLeft size={14} /> 我的作品
                </button>
                <h1>
                  {project.title}
                  <span className="tiny-badge">
                    {project.provider === "demo" ? "示例作品" : "AI 作品"}
                  </span>
                </h1>
                <p>{project.prompt}</p>
              </div>
              <div className="project-actions">
                <button
                  className="secondary-button"
                  onClick={() => download("json")}
                  disabled={!!busy}
                >
                  <Download size={15} /> 项目文件
                </button>
                <button
                  className="primary-button"
                  onClick={() => download("html")}
                  disabled={!project.html || !!busy}
                >
                  <ExternalLink size={16} /> 导出作品
                </button>
              </div>
            </div>
            <div className="journey" aria-label="创作进度">
              {["说出想法", "拆成积木", "搭建与试玩", "解释与分享"].map(
                (s, i) => (
                  <div
                    key={s}
                    className={
                      (i < 2 || (i === 2 && done > 0) || (i === 3 && checked)
                        ? "complete "
                        : "") + (i === 2 && !checked ? "current" : "")
                    }
                  >
                    <span>
                      {i < 2 || (i === 3 && checked) ? (
                        <Check size={13} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <strong>{s}</strong>
                    {i < 3 && <div />}
                  </div>
                ),
              )}
            </div>
            <div className="workbench-grid">
              <section className="build-column">
                <div className="section-heading">
                  <div>
                    <h2>
                      <Layers3 size={19} /> 你的创作地图
                    </h2>
                    <p>每个模块，负责一件小事。</p>
                  </div>
                  <span className="tiny-badge">
                    {done} / {project.modules.length} 已搭建
                  </span>
                </div>
                <div className="module-map">
                  {project.modules.map((m, i) => (
                    <button
                      key={m.id}
                      className={
                        "module-card module-" +
                        (i % 4) +
                        (m.id === current?.id ? " selected" : "") +
                        (m.status === "done" ? " built" : "")
                      }
                      onClick={() => {
                        setSelected(m.id);
                        setView("code");
                      }}
                    >
                      <div className="module-top">
                        <span className="module-icon">
                          {i % 4 === 0 ? (
                            <Gamepad2 size={21} />
                          ) : i % 4 === 1 ? (
                            <Sparkles size={21} />
                          ) : i % 4 === 2 ? (
                            <Code2 size={21} />
                          ) : (
                            <Timer size={21} />
                          )}
                        </span>
                        <span className="module-number">0{i + 1}</span>
                        {m.status === "done" && <CheckCircle2 size={16} />}
                      </div>
                      <h3>{m.title}</h3>
                      <p>{m.description}</p>
                      <div className="module-card-bottom">
                        <span>
                          <FileCode2 size={12} />
                          {m.files.length} 个代码片段
                        </span>
                        <span>{m.status === "done" ? "已搭建" : "待搭建"}</span>
                      </div>
                      {m.dependsOn.length > 0 && (
                        <div className="depends-label">
                          连接：
                          {m.dependsOn
                            .map(
                              (id) =>
                                project.modules.find((x) => x.id === id)
                                  ?.title ?? id,
                            )
                            .join(" + ")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="build-next primary-button"
                  disabled={!!busy || !next}
                  onClick={() => build()}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={17} />
                  ) : next ? (
                    <WandSparkles size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}{" "}
                  {busy
                    ? busy
                    : next
                      ? "搭建下一块 · " + next.title
                      : "积木搭好了，去试玩吧！"}{" "}
                  {!busy && next && <ArrowRight size={16} />}
                </button>
                {current && (
                  <div className="module-inspector">
                    <div className="inspector-title">
                      <span className="eyebrow">INSIDE THE BLOCK</span>
                      <h3>{current.title}</h3>
                    </div>
                    <div className="concept">
                      <Lightbulb size={18} />
                      <div>
                        <strong>原来是这样</strong>
                        <p>{current.concept}</p>
                      </div>
                    </div>
                    <div className="file-tags">
                      {current.files.map((f) => (
                        <span key={f}>
                          <FileCode2 size={12} />
                          {f}
                        </span>
                      ))}
                    </div>
                    <label htmlFor="revision">给这块积木一个新想法</label>
                    <div className="revision-row">
                      <input
                        id="revision"
                        disabled={project.provider === "demo"}
                        value={revision}
                        onChange={(e) => setRevision(e.target.value)}
                        placeholder={
                          project.provider === "demo"
                            ? "试试下方的颜色、速度和目标参数"
                            : "比如：接到星星时，让角色开心地跳一下"
                        }
                      />
                      <button
                        aria-label="修改当前模块"
                        disabled={
                          project.provider === "demo" ||
                          !!busy ||
                          !revision.trim() ||
                          current.status !== "done"
                        }
                        onClick={() => build(current.id, revision)}
                      >
                        <ArrowRight size={17} />
                      </button>
                    </div>
                    {project.provider === "demo" && (
                      <small>
                        示例模式仅支持预设参数修改；自由描述修改需要 AI 模式。
                      </small>
                    )}
                    <div className="tweak-controls">
                      <label>
                        主题色
                        <input
                          type="color"
                          aria-label="主题色"
                          value={project.config.accent}
                          disabled={!!busy}
                          onChange={(e) => config("accent", e.target.value)}
                        />
                      </label>
                      {project.template === "star-catcher" ? (
                        <>
                          <label>
                            速度
                            <select
                              aria-label="星星速度"
                              value={project.config.speed}
                              disabled={!!busy}
                              onChange={(e) =>
                                config("speed", Number(e.target.value))
                              }
                            >
                              {[0.5, 1, 1.5, 2, 3].map((n) => (
                                <option value={n} key={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            目标
                            <select
                              aria-label="接星目标"
                              value={project.config.target}
                              disabled={!!busy}
                              onChange={(e) =>
                                config("target", Number(e.target.value))
                              }
                            >
                              {[5, 10, 15, 20, 30].map((n) => (
                                <option value={n} key={n}>
                                  {n} 颗
                                </option>
                              ))}
                            </select>
                          </label>
                        </>
                      ) : project.template === "focus-timer" ? (
                        <label>
                          专注时长
                          <select
                            aria-label="专注时长"
                            value={project.config.durationMinutes}
                            disabled={!!busy}
                            onChange={(e) =>
                              config("durationMinutes", Number(e.target.value))
                            }
                          >
                            {[1, 5, 15, 25, 45].map((n) => (
                              <option key={n} value={n}>
                                {n} 分钟
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <label>
                          宠物昵称
                          <input
                            key={project.id + project.config.petName}
                            aria-label="宠物昵称"
                            defaultValue={project.config.petName}
                            maxLength={20}
                            disabled={!!busy}
                            onBlur={(e) => {
                              if (
                                e.target.value &&
                                e.target.value !== project.config.petName
                              )
                                void config("petName", e.target.value);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </section>
              <section
                className={
                  "preview-column " + (full ? "fullscreen-preview" : "")
                }
              >
                <div className="preview-toolbar">
                  <div>
                    <button
                      className={view === "preview" ? "active" : ""}
                      onClick={() => setView("preview")}
                    >
                      <Play size={14} /> 作品预览
                    </button>
                    <button
                      className={view === "code" ? "active" : ""}
                      onClick={() => setView("code")}
                    >
                      <Code2 size={15} /> 积木代码
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => setPreviewKey((k) => k + 1)}
                      aria-label="重新运行预览"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      onClick={() => setFull(!full)}
                      aria-label={full ? "退出全屏预览" : "放大预览"}
                    >
                      {full ? <X size={17} /> : <Maximize2 size={15} />}
                    </button>
                  </div>
                </div>
                <div className="preview-area">
                  {view === "code" ? (
                    <div className="source-view">
                      <span>{current?.files.join(" · ")}</span>
                      <pre>
                        {current?.source ||
                          "这块积木还在等待搭建。完成后，可以在这里发现让它动起来的代码。"}
                      </pre>
                    </div>
                  ) : project.html ? (
                    <iframe
                      key={previewKey + project.updatedAt}
                      title="作品试玩"
                      sandbox="allow-scripts"
                      referrerPolicy="no-referrer"
                      srcDoc={previewHtml}
                    />
                  ) : (
                    <div className="preview-empty">
                      <Mascot />
                      <h3>你的想法，很快就会动起来。</h3>
                      <p>
                        点击「搭建下一块」，
                        <br />
                        一起放下第一块积木。
                      </p>
                      <span>
                        <Play size={12} /> 在这里试玩你的作品
                      </span>
                    </div>
                  )}
                </div>
                <div className="preview-caption">
                  <span className="status-dot" />
                  {project.html
                    ? "可以直接在画面中操作 · 修改会重新开始"
                    : "搭建完成的模块会在这里出现"}
                  <span>LOCAL PREVIEW</span>
                </div>
                <div className="learning-challenge">
                  <span className="challenge-icon">
                    <Lightbulb size={21} />
                  </span>
                  <div>
                    <span className="eyebrow">轮到你的好奇心上场</span>
                    <h3>
                      小挑战：
                      {current?.challenge || "试着解释你的作品是怎么工作的。"}
                    </h3>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={done !== project.modules.length}
                        onChange={(e) =>
                          saveLearning(e.target.checked, reflection)
                        }
                      />{" "}
                      我已经试玩，并能说出一个模块的作用
                    </label>
                    {checked && (
                      <>
                        <textarea
                          aria-label="我的发现"
                          maxLength={2000}
                          value={reflection}
                          onChange={(e) =>
                            saveLearning(checked, e.target.value)
                          }
                          placeholder="把你的发现写下来：我改变了……结果……"
                        />
                        <p>
                          发现保存在此浏览器。这是你的自我检查，继续试出更多可能吧！
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </main>
        )}
      </div>
      <nav className="rail rail-right" aria-label="芽芽小助手">
        <button
          className="rail-toggle"
          onClick={() => setGuideOpen((v) => !v)}
          aria-label={guideOpen ? "收起小助手" : "展开小助手"}
          aria-expanded={guideOpen}
        >
          <Lightbulb size={20} />
        </button>
      </nav>
      {(navOpen || guideOpen) && (
        <div
          className="drawer-backdrop"
          onClick={() => {
            setNavOpen(false);
            setGuideOpen(false);
          }}
        />
      )}
      {guideOpen && (
        <aside className="guide-sidebar drawer">
          <button
            className="drawer-close"
            aria-label="收起小助手"
            onClick={() => setGuideOpen(false)}
          >
            <X size={18} />
          </button>
          <div className="guide-header">
          <span>
            <span className="guide-avatar">
              <Mascot />
            </span>
            <div>
              <strong>芽芽</strong>
              <small>
                <span /> 你的创作搭子
              </small>
            </div>
          </span>
        </div>
        <div className="guide-content">
          <div className="guide-welcome">
            <Mascot mood={busy ? "thinking" : "happy"} />
            <h3>{project ? "一步一步，想法会长大。" : "嗨，我是芽芽！"}</h3>
            <p>
              {project
                ? "我会陪你看清每一块积木的作用。犯错也没关系，试一试就有新发现。"
                : "不用一开始就会写代码。带上你的好奇心，我们一起把「如果」变成「看！」。"}
            </p>
          </div>
          <span className="guide-label">
            {project ? "接下来可以这样做" : "你的创作小路线"}
          </span>
          <div className="guide-steps">
            {(project
              ? [
                  {
                    title: next ? "搭建「" + next.title + "」" : "试玩你的作品",
                    text:
                      next?.description ??
                      "点一点、动一动，看看结果是否和想的一样。",
                  },
                  {
                    title: "改变一个小细节",
                    text: "试着修改颜色或玩法，看看哪里跟着变化。",
                  },
                  {
                    title: "把发现讲给别人听",
                    text: "完成小挑战，再把作品导出给家人体验。",
                  },
                ]
              : [
                  {
                    title: "给我一个小想法",
                    text: "不确定也没关系，先选一颗灵感种子。",
                  },
                  {
                    title: "一起拆成小积木",
                    text: "角色、规则、画面……每块都看得懂。",
                  },
                  {
                    title: "边搭边玩，边玩边懂",
                    text: "试着改变一点点，创造就发生了。",
                  },
                ]
            ).map((s, i) => (
              <div key={i}>
                <span>{i + 1}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          {project && (
            <div className="activity-log">
              <span className="guide-label">我们走过的每一步</span>
              {project.activity
                .slice(-5)
                .reverse()
                .map((a) => (
                  <div key={a.id}>
                    <CheckCircle2 size={13} />
                    <p>
                      {a.message}
                      <small>
                        {new Date(a.at).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </p>
                  </div>
                ))}
            </div>
          )}
          <div className="guide-tip">
            <Lightbulb size={19} />
            <strong>今天的一点小知识</strong>
            <p>
              游戏里的「分数」是一个变量。就像一个小盒子，可以装着数字，也可以随时更新。
            </p>
            <span>你已经在像创造者一样思考了 ✧</span>
          </div>
        </div>
        <div className="guide-footer">
          <Heart size={14} /> 按你的节奏，每一步都算数。
        </div>
          </aside>
        )}
      {busy && (
        <div className="working-toast" role="status">
          <LoaderCircle size={17} className="spin" />
          {busy}
          <span>请稍等</span>
        </div>
      )}
      {settings && (
        <div
          className="studio-modal-backdrop"
          onClick={() => setSettings(false)}
        >
          <section
            className="studio-modal"
            ref={dialog}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="创作设置"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="关闭设置"
              onClick={() => setSettings(false)}
            >
              <X size={20} />
            </button>
            <span className="eyebrow">给创造一点动力</span>
            <h2>选择你的创作方式</h2>
            <p>为下一个新作品选择方式。已保存的作品会保留创建时的模式。</p>
            <div className="provider-options">
              {(["demo", "codex", "api"] as Provider[]).map((id) => {
                const p = status?.providers.find((p) => p.id === id);
                return (
                  <button
                    key={id}
                    disabled={!!busy || !(p?.available ?? id === "demo")}
                    className={provider === id ? "chosen" : ""}
                    onClick={() => setProvider(id)}
                  >
                    <span>
                      {id === "demo" ? (
                        <Layers3 />
                      ) : id === "codex" ? (
                        <Code2 />
                      ) : (
                        <Sparkles />
                      )}
                    </span>
                    <div>
                      <strong>
                        {id === "demo"
                          ? "示例配方 · 无需连接"
                          : id === "codex"
                            ? "Codex · 本地 AI 额度"
                            : "外部 API · 自选模型"}
                      </strong>
                      <p>
                        {p?.detail ??
                          (id === "demo"
                            ? "三个预设项目，可搭建、修改参数和导出。"
                            : "正在检查连接状态…")}
                      </p>
                    </div>
                    {provider === id && <CheckCircle2 size={19} />}
                  </button>
                );
              })}
            </div>
            <div className="setup-note">
              <strong>家长 / 导师配置</strong>
              <p>
                Codex 使用启动服务的本地账号。外部 API 使用服务端环境变量
                SPROUT_API_KEY、SPROUT_API_BASE、SPROUT_MODEL，详见项目
                README。密钥不保存到浏览器。AI 描述会发送给所选服务。
              </p>
              <p>
                当前为本地原型，建议 10–16
                岁在成人陪伴下使用。套餐与公开作品社区尚未上线。
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setSettings(false)}
            >
              准备好了 <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
      {lesson && (
        <div className="studio-modal-backdrop" onClick={() => setLesson(false)}>
          <section
            className="studio-modal lesson-modal"
            ref={dialog}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="灵感小课堂"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="关闭小课堂"
              onClick={() => setLesson(false)}
            >
              <X size={20} />
            </button>
            <Mascot />
            <span className="eyebrow">创造者的第一课</span>
            <h2>大想法，从小积木开始。</h2>
            <p>
              一个小游戏，可以分成画面、角色、规则和反馈。每个模块解决一件事，再连接起来，就是你的作品。
            </p>
            <ol>
              <li>
                <strong>先预测</strong>：把接星星的目标从 10 改成
                5，会发生什么？
              </li>
              <li>
                <strong>再试试</strong>
                ：搭建积木，在预览里玩一次，然后改一个参数。
              </li>
              <li>
                <strong>说发现</strong>
                ：点开积木代码，找找存放目标数字的「变量」。
              </li>
            </ol>
            <div className="setup-note">
              AI
              也会犯错。生成结果先试玩，遇到问题时描述「期待什么、实际发生了什么」，再一起修改。
            </div>
            <button className="primary-button" onClick={() => setLesson(false)}>
              我想试试 <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
