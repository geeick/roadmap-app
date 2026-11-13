import { useEffect, useState } from "react";
import { getListings } from "./db";
import { getSaved, removeResource, saveResource, setCheck } from "./profileDb";
import type { Listing } from "./seed";
import type { Diagnosis, Item, Step } from "./data";

const icon = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
} as const;

const initials = (name: string) =>
  (name.replace(/^Dr\.\s+/, "").match(/[A-Za-z]+/g) ?? []).slice(0, 2).map((w) => w[0]).join("");

function Card({ l, color, selected, busy, onToggle }: {
  l: Listing; color: string; selected: boolean; busy: boolean; onToggle: () => void;
}) {
  return (
    <li className={l.phone ? "card" : "card plain"}>
      {l.phone && <span className="avatar" style={{ borderColor: color }}>{initials(l.name)}</span>}
      <h3>{l.name}</h3>
      {l.phone && (
        <div className="actions">
          <a href={`tel:${l.phone}`} aria-label={`Call ${l.name}`}>
            <svg {...icon}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </a>
          {l.video && (
            <a href={l.video} target="_blank" rel="noreferrer" aria-label={`Video visit with ${l.name}`}>
              <svg {...icon}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            </a>
          )}
        </div>
      )}
      <p className="meta">
        {l.fields.map(([k, v]) => <span key={k}><b>{k}:</b> {v}</span>)}
      </p>
      {l.tags.length > 0 && <p className="tags">{l.tags.join(" | ")}</p>}
      {l.url && <a className="open" href={l.url} target="_blank" rel="noreferrer">Open</a>}
      
      <button
        type="button"
        className={`select-btn ${selected ? "selected" : ""}`}
        onClick={onToggle}
        disabled={busy}
        aria-pressed={selected}
      >
        {busy ? "Saving..." : selected ? "Selected ✓" : "Select"}
      </button>

    </li>
  );
}

function Row({ item, dx, color, userId, stepIndex, itemIndex }: {
  item: Item; dx: string; color: string; userId: string; stepIndex: number; itemIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Listing[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setRows(null); setSelected(new Set()); setOpen(false); setError("");
    return () => { active = false; };
  }, [dx, userId, stepIndex, itemIndex]);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (rows !== null) return;
    setLoading(true); setError("");
    try {
      const [listings, saves] = await Promise.all([getListings(item.category, dx), getSaved(userId, dx)]);
      setRows(listings);
      setSelected(new Set(saves.filter((s) => s.step_index === stepIndex && s.item_index === itemIndex).map((s) => s.listing_id)));
    } catch (e) { setError((e as Error).message); setRows([]); }
    finally { setLoading(false); }
  };

  const update = async (l: Listing) => {
    setBusyId(l.id); setError("");
    try {
      if (selected.has(l.id)) {
        await removeResource(userId, dx, stepIndex, itemIndex, l.id);
        setSelected((old) => { const next = new Set(old); next.delete(l.id); return next; });
      } else {
        await saveResource(userId, dx, stepIndex, itemIndex, item.category, l.id);
        await setCheck(userId, dx, stepIndex, itemIndex, true);
        setSelected((old) => new Set(old).add(l.id));
      }
    } catch (e) { setError((e as Error).message); }
    finally { setBusyId(""); }
  };

  return (
    <li style={{ borderColor: color }}>
      <button className="item" aria-expanded={open} onClick={toggle}>
        {item.label}<span className="chev" aria-hidden="true" />
      </button>
      {open && (
        <>
          {error && <p className="error row-error" role="alert">{error}</p>}
          {loading || rows === null ? <p className="hint">Loading…</p>
            : rows.length === 0 ? <p className="hint">No listings yet</p>
            : <ul className="cards">{rows.map((l) => (
              <Card key={l.id} l={l} color={color} selected={selected.has(l.id)}
                busy={!!busyId} onToggle={() => update(l)} />
            ))}</ul>}
        </>
      )}
    </li>
  );
}

export default function StepPage({ d, step, n, userId }: {
  d: Diagnosis; step: Step; n: number; userId: string;
}) {
  return (
    <main className="roadmap step">
      <div className="banner" style={{ background: d.color }} />
      <a className="back" href="#/">Back to road map</a>
      <h1 style={{ color: step.ink ?? step.color }}>
        <span className="badge" style={{ background: step.color }}>{n}</span>
        {step.title}
      </h1>
      <ul className="items">
        {step.items.map((item, index) => (
          <Row key={`${n}:${index}`} item={item} dx={d.id} color={step.color}
            userId={userId} stepIndex={n - 1} itemIndex={index} />
        ))}
      </ul>
    </main>
  );
}
