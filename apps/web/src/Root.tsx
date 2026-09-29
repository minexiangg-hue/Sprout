import { lazy, Suspense, useEffect, useState } from "react";
import Studio from "./studio/Studio";
const Expert = lazy(() => import("./App"));
export default function Root() {
  const [expert, setExpert] = useState(location.hash === "#expert");
  useEffect(() => {
    const change = () => setExpert(location.hash === "#expert");
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return expert ? (
    <Suspense fallback={<p>正在打开 GraphCode 专业工作台…</p>}>
      <Expert />
      <a className="expert-home-link" href="#">
        ← 芽芽工坊
      </a>
    </Suspense>
  ) : (
    <Studio />
  );
}
