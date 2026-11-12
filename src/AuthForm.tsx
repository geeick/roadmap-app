import { useState, type FormEvent } from "react";
import { diagnoses } from "./data";
import { logIn, signUp, type User } from "./auth";

export default function AuthForm({ onDone }: { onDone: (u: User) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [error, setError] = useState("");

  const picked = diagnoses.find((d) => d.id === diagnosis);
  const signingUp = mode === "signup";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      onDone(signingUp ? await signUp(email, password, diagnosis) : await logIn(email, password));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <div className="banner" style={{ background: picked?.color ?? "#6FE0FA" }} />
      <form className="auth" onSubmit={submit}>
        <h1>{signingUp ? "Create your account" : "Log in"}</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        {signingUp && (
          <fieldset>
            <legend>Choose your diagnosis</legend>
            {diagnoses.map((d) => (
              <label key={d.id} className={diagnosis === d.id ? "pick on" : "pick"} style={{ borderColor: d.color }}>
                <input type="radio" name="diagnosis" value={d.id} checked={diagnosis === d.id} onChange={() => setDiagnosis(d.id)} required />
                <span className="dot" style={{ background: d.color }} />
                {d.name}
              </label>
            ))}
          </fieldset>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit">{signingUp ? "Create account" : "Log in"}</button>
        <button type="button" className="link" onClick={() => { setError(""); setMode(signingUp ? "login" : "signup"); }}>
          {signingUp ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </form>
    </>
  );
}
