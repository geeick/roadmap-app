import { useEffect, useMemo, useState } from "react";
import type { User } from "./auth";
import type { Diagnosis } from "./data";
import { checkKey, getChecks, getSaved, removeResource, setCheck, type SavedWithListing } from "./profileDb";

const careCategories = new Set(["neurologist", "pcp", "supportive-care", "social-worker", "counselor", "therapy", "spiritual"]);

export default function Profile({ user, diagnosis }: { user: User; diagnosis: Diagnosis }) {
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<SavedWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getChecks(user.id, diagnosis.id), getSaved(user.id, diagnosis.id)])
      .then(([c, s]) => { if (active) { setChecks(c); setSaved(s); } })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.id, diagnosis.id]);

  const total = diagnosis.steps.reduce((n, s) => n + s.items.length, 0);
  const completed = checks.size;
  const careTeam = useMemo(() => saved.filter((s) => careCategories.has(s.category)), [saved]);
  const resources = useMemo(() => saved.filter((s) => !careCategories.has(s.category)), [saved]);

  async function toggle(stepIndex: number, itemIndex: number, value: boolean) {
    const key = checkKey(stepIndex, itemIndex);
    setBusy(key); setError("");
    try {
      await setCheck(user.id, diagnosis.id, stepIndex, itemIndex, value);
      setChecks((old) => {
        const updated = new Set(old);
        if (value) updated.add(key); else updated.delete(key);
        return updated;
      });
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
      <section className="profile-section">
        <h2>My information</h2>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Diagnosis:</b> {diagnosis.name}</p>
        <p><b>Account type:</b> {user.role}</p>
      </section>
      {error && <p className="error" role="alert">{error}</p>}
      {loading ? <p>Loading profile…</p> : (
        <>
          <section className="profile-section">
            <h2>Roadmap checklist</h2>
            <p>{completed} of {total} completed</p>
            <div className="progress-track"><div style={{ width: `${total ? completed / total * 100 : 0}%`, background: diagnosis.color }} /></div>
            {diagnosis.steps.map((step, si) => (
              <div key={si} className="check-group">
                <h3 style={{ color: step.ink ?? step.color }}>{si + 1}. {step.title}</h3>
                {step.items.map((item, ii) => {
                  const key = checkKey(si, ii);
                  return <label key={key} className="profile-check">
                    <input type="checkbox" checked={checks.has(key)} disabled={!!busy}
                      onChange={(e) => toggle(si, ii, e.target.checked)} />
                    <span>{item.label}</span>
                    <a href={`#/step/${si + 1}`} aria-label={`Open ${item.label}`}>View</a>
                  </label>;
                })}
              </div>
            ))}
          </section>
          <section className="profile-section">
            <h2>My care team</h2>
            {renderSaved(careTeam, "No care team members saved yet. Open a roadmap step to choose one.")}
          </section>
          <section className="profile-section">
            <h2>Saved resources</h2>
            {renderSaved(resources, "No resources saved yet.")}
          </section>
        </>
      )}
    </main>
  );
}
