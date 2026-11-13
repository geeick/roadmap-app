import { useEffect, useMemo, useState } from "react";
import type { User } from "./auth";
import type { Diagnosis } from "./data";
import { checkKey, getChecks, getSaved, removeResource, setCheck, type SavedWithListing } from "./profileDb";

const careCategories = new Set(["neurologist", "pcp", "supportive-care", "social-worker", "counselor", "therapy", "spiritual"]);
type Page = "overview" | "checklist" | "care-team" | "resources" | "account";
const pages: { id: Page; title: string; description: string }[] = [
  { id: "overview", title: "Overview", description: "Your roadmap at a glance" },
  { id: "checklist", title: "Roadmap checklist", description: "Track every step" },
  { id: "care-team", title: "My care team", description: "Your selected providers" },
  { id: "resources", title: "Saved resources", description: "Everything you've bookmarked" },
  { id: "account", title: "My information", description: "Your account and diagnosis" },
];
const href = (page: Page) => page === "overview" ? "#/profile" : `#/profile/${page}`;

export default function Profile({ user, diagnosis, page }: { user: User; diagnosis: Diagnosis; page: string }) {
  const current: Page = pages.some((p) => p.id === page) ? page as Page : "overview";
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<SavedWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    Promise.all([getChecks(user.id, diagnosis.id), getSaved(user.id, diagnosis.id)])
      .then(([c, s]) => { if (active) { setChecks(c); setSaved(s); } })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id, diagnosis.id, current]);

  const total = diagnosis.steps.reduce((n, s) => n + s.items.length, 0);
  const completed = checks.size;
  const careTeam = useMemo(() => saved.filter((s) => careCategories.has(s.category)), [saved]);
  const resources = useMemo(() => saved.filter((s) => !careCategories.has(s.category)), [saved]);

  async function toggle(stepIndex: number, itemIndex: number, value: boolean) {
    const key = checkKey(stepIndex, itemIndex);
    setBusy(key); setError("");
    try {
      await setCheck(user.id, diagnosis.id, stepIndex, itemIndex, value);
      setChecks((old) => { const next = new Set(old); if (value) next.add(key); else next.delete(key); return next; });
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(""); }
  }

  async function remove(s: SavedWithListing) {
    const key = `remove:${s.listing_id}:${s.step_index}:${s.item_index}`;
    setBusy(key); setError("");
    try {
      await removeResource(user.id, diagnosis.id, s.step_index, s.item_index, s.listing_id);
      setSaved((old) => old.filter((x) => !(x.listing_id === s.listing_id && x.step_index === s.step_index && x.item_index === s.item_index)));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(""); }
  }

  const progress = (
    <div className="profile-progress">
      <div className="profile-progress-heading"><strong>Roadmap progress</strong><span>{completed} of {total} completed</span></div>
      <div className="progress-track" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label="Roadmap completion">
        <div style={{ width: `${total ? completed / total * 100 : 0}%`, background: diagnosis.color }} />
      </div>
    </div>
  );

  const renderSaved = (rows: SavedWithListing[], empty: string) => rows.length ? (
    <ul className="profile-saved">
      {rows.map((s) => (
        <li key={`${s.step_index}-${s.item_index}-${s.listing_id}`}>
          <div>
            <strong>{s.listing.name}</strong>
            <p>{diagnosis.steps[s.step_index]?.items[s.item_index]?.label ?? s.category}</p>
            {s.listing.phone && <a href={`tel:${s.listing.phone}`}>{s.listing.phone}</a>}
            {s.listing.url && <a href={s.listing.url} target="_blank" rel="noreferrer">Website</a>}
          </div>
          <button type="button" className="small-action" disabled={!!busy} onClick={() => remove(s)}>Remove</button>
        </li>
      ))}
    </ul>
  ) : <p className="profile-empty">{empty}</p>;

  return (
    <main className="roadmap profile-page">
      <div className="banner" style={{ background: diagnosis.color }} />
      <h1>My profile</h1>
      <nav className="profile-subnav" aria-label="Profile sections">
        {pages.map((p) => <a key={p.id} href={href(p.id)} className={current === p.id ? "profile-tab active" : "profile-tab"} aria-current={current === p.id ? "page" : undefined}>{p.title}</a>)}
      </nav>
      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <p className="profile-loading">Loading profile…</p> : (
        <>
          {current === "overview" && (
            <>
              <section className="profile-section">
                <h2>Your roadmap</h2>
                <p className="profile-subtitle">{diagnosis.name}</p>
                {progress}
                <a className="profile-primary-link" href={href("checklist")}>Open checklist <span aria-hidden="true">→</span></a>
              </section>
              <div className="profile-tiles">
                <a href={href("care-team")} className="profile-tile"><span className="profile-tile-number" style={{ color: diagnosis.color }}>{careTeam.length}</span><strong>My care team</strong><span>View selected providers →</span></a>
                <a href={href("resources")} className="profile-tile"><span className="profile-tile-number" style={{ color: diagnosis.color }}>{resources.length}</span><strong>Saved resources</strong><span>View bookmarks →</span></a>
              </div>
              <section className="profile-section profile-compact"><h2>My information</h2><p><b>Diagnosis:</b> {diagnosis.name}</p><a className="profile-text-link" href={href("account")}>View account details →</a></section>
            </>
          )}
          {current === "checklist" && (
            <section className="profile-section">
              <h2>Roadmap checklist</h2>
              {progress}
              {diagnosis.steps.map((step, si) => (
                <div key={si} className="check-group">
                  <h3 style={{ color: step.ink ?? step.color }}>{si + 1}. {step.title}</h3>
                  {step.items.map((item, ii) => {
                    const key = checkKey(si, ii);
                    return <div key={key} className="profile-check">
                      <label className="profile-check-label">
                        <input type="checkbox" checked={checks.has(key)} disabled={!!busy} onChange={(e) => toggle(si, ii, e.target.checked)} />
                        <span>{item.label}</span>
                      </label>
                      <a href={`#/step/${si + 1}`} aria-label={`Open ${item.label}`}>View</a>
                    </div>;
                  })}
                </div>
              ))}
            </section>
          )}
          {current === "care-team" && <section className="profile-section"><h2>My care team</h2>{renderSaved(careTeam, "No care team members saved yet. Choose a provider from your roadmap.")}<a className="profile-text-link" href="#/step/1">Browse care team →</a></section>}
          {current === "resources" && <section className="profile-section"><h2>Saved resources</h2>{renderSaved(resources, "No saved resources yet. Select resources from your roadmap.")}<a className="profile-text-link" href="#/">Browse roadmap →</a></section>}
          {current === "account" && <section className="profile-section profile-account"><h2>My information</h2><div><span>Email</span><strong>{user.email}</strong></div><div><span>Diagnosis</span><strong>{diagnosis.name}</strong></div><div><span>Account type</span><strong>{user.role}</strong></div></section>}
        </>
      )}
    </main>
  );
}
