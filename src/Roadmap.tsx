import { useEffect, useRef } from "react";
import type { Diagnosis } from "./data";

const W = 96;
const ROW = 220;
const x = (i: number) => (i % 2 === 0 ? 30 : W - 30);
const y = (i: number) => ROW * i + ROW / 2;
const href = (i: number) => `#/step/${i + 1}`;

export default function Roadmap({ d }: { d: Diagnosis }) {
  const n = d.steps.length;
  const roadRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = roadRef.current;
    if (!svg) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (reducedMotion.matches) {
          svg.style.removeProperty("--road-shift");
          svg.style.removeProperty("--dash-offset");
          return;
        }
        // Subtle sideways parallax keeps markers close to their labels.
        const shift = Math.min(window.scrollY * 0.018, 18);
        svg.style.setProperty("--road-shift", `${shift}px`);
        svg.style.setProperty("--dash-offset", `${window.scrollY * 0.25}px`);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    reducedMotion.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      reducedMotion.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  let path = `M ${x(0)} 0 L ${x(0)} ${y(0)}`;
  for (let i = 1; i < n; i++) {
    const mid = (y(i - 1) + y(i)) / 2;
    path += ` C ${x(i - 1)} ${mid} ${x(i)} ${mid} ${x(i)} ${y(i)}`;
  }
  path += ` L ${x(n - 1)} ${ROW * n}`;

  return (
    <main className="roadmap">
      <div className="banner" style={{ background: d.color }} />
      <h1>
        <span className="light">Road Map After</span>
        <span className="name">{d.name}</span>
        <span className="light">Diagnosis:</span>
      </h1>
      <p className="subtitle">{d.subtitle}</p>

      <div className="road">
        <svg ref={roadRef} className="parallax-road" width={W} height={ROW * n} viewBox={`0 0 ${W} ${ROW * n}`} aria-hidden="true">
          <g className="road-layer">
            <path d={path} className="asphalt" />
            <path d={path} className="dashes" />
          {d.steps.map((s, i) => (
            <a key={s.title} href={href(i)} className="pin" tabIndex={-1}>
              <circle cx={x(i)} cy={y(i)} r={20} fill={s.color} stroke="#fff" strokeWidth={3} />
              <text x={x(i)} y={y(i)} className="num">{i + 1}</text>
            </a>
          ))}
          </g>
        </svg>
        <ol>
          {d.steps.map((s, i) => (
            <li key={s.title} style={{ height: ROW }}>
              <a href={href(i)}>
                <h2 style={{ color: s.ink ?? s.color }}>{s.title}</h2>
                <ul>
                  {s.items.map((item) => (
                    <li key={item.label}>{item.label}</li>
                  ))}
                </ul>
              </a>
            </li>
          ))}
        </ol>
      </div>

      {d.resourcesUrl && (
        <p className="all">
          To view all resources visit <a href={d.resourcesUrl} target="_blank" rel="noreferrer">{d.resourcesUrl}</a>
        </p>
      )}
    </main>
  );
}
