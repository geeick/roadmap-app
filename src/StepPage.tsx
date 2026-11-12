import { useState } from "react";
import { getListings } from "./db";
import type { Listing } from "./seed";
import type { Diagnosis, Item, Step } from "./data";

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const initials = (name: string) =>
  (name.replace(/^Dr\.\s+/, "").match(/[A-Za-z]+/g) ?? []).slice(0, 2).map((w) => w[0]).join("");

function Card({ l, color }: { l: Listing; color: string }) {
  return (
    <li className={l.phone ? "card" : "card plain"}>
      {l.phone && <span className="avatar" style={{ borderColor: color }}>{initials(l.name)}</span>}
      <h3>{l.name}</h3>
      {l.phone && (
        <div className="actions">
          <a href={`tel:${l.phone}`} aria-label={`Call ${l.name}`}>
            <svg {...icon}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </a>
          {l.video && (
            <a href={l.video} target="_blank" rel="noreferrer" aria-label={`Video visit with ${l.name}`}>
              <svg {...icon}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            </a>
          )}
        </div>
      )}
      <p className="meta">
        {l.fields.map(([k, v]) => (
          <span key={k}><b>{k}:</b> {v}</span>
        ))}
      </p>
      {l.tags.length > 0 && <p className="tags">{l.tags.join(" | ")}</p>}
      {l.url && <a className="open" href={l.url} target="_blank" rel="noreferrer">Open</a>}
    </li>
  );
}

function Row({ item, dx, color }: { item: Item; dx: string; color: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Listing[] | null>(null);

  const toggle = async () => {
    setOpen(!open);
    if (!rows) setRows(await getListings(item.category, dx));
  };

  return (
    <li style={{ borderColor: color }}>
      <button className="item" aria-expanded={open} onClick={toggle}>
        {item.label}
        <span className="chev" aria-hidden="true" />
      </button>
      {open &&
        (rows === null ? (
          <p className="hint">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="hint">No listings yet</p>
        ) : (
          <ul className="cards">
            {rows.map((l) => (
              <Card key={l.id} l={l} color={color} />
            ))}
          </ul>
        ))}
    </li>
  );
}

export default function StepPage({ d, step, n }: { d: Diagnosis; step: Step; n: number }) {
  return (
    <main className="roadmap step">
      <div className="banner" style={{ background: d.color }} />
      <a className="back" href="#">Back to road map</a>
      <h1 style={{ color: step.ink ?? step.color }}>
        <span className="badge" style={{ background: step.color }}>{n}</span>
        {step.title}
      </h1>
      <ul className="items">
        {step.items.map((item) => (
          <Row key={item.label} item={item} dx={d.id} color={step.color} />
        ))}
      </ul>
    </main>
  );
}
