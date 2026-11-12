import type { Diagnosis } from "./data";

const W = 96;
const ROW = 220;
const x = (i: number) => (i % 2 === 0 ? 30 : W - 30);
const y = (i: number) => ROW * i + ROW / 2;
const href = (i: number) => `#/step/${i + 1}`;

export default function Roadmap({ d }: { d: Diagnosis }) {
  const n = d.steps.length;
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
        <svg width={W} height={ROW * n} viewBox={`0 0 ${W} ${ROW * n}`} aria-hidden="true">
          <path d={path} className="asphalt" />
          <path d={path} className="dashes" />
          {d.steps.map((s, i) => (
            <a key={s.title} href={href(i)} className="pin" tabIndex={-1}>
              <circle cx={x(i)} cy={y(i)} r={20} fill={s.color} stroke="#fff" strokeWidth={3} />
              <text x={x(i)} y={y(i)} className="num">{i + 1}</text>
            </a>
          ))}
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
