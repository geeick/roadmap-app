import { useEffect, useState } from "react";
import AuthForm from "./AuthForm";
import Roadmap from "./Roadmap";
import StepPage from "./StepPage";
import Profile from "./Profile";
import NavBar from "./NavBar";
import { currentUser, logOut, type User } from "./auth";
import { diagnoses } from "./data";

const useHash = () => {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onChange = () => setHash(location.hash);
    addEventListener("hashchange", onChange);
    return () => removeEventListener("hashchange", onChange);
  }, []);
  return hash;
};

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const hash = useHash();

  useEffect(() => {
    currentUser().then(setUser).catch(() => setUser(null));
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [hash]);

  if (user === undefined) return null;
  const diagnosis = diagnoses.find((d) => d.id === user?.diagnosis);
  if (!user || !diagnosis) return <AuthForm onDone={setUser} />;

  const n = Number(hash.match(/^#\/step\/(\d+)$/)?.[1]);
  const step = diagnosis.steps[n - 1];

  return (
    <>
      {hash.startsWith("#/profile") ? (
        <Profile user={user} diagnosis={diagnosis} page={hash.split("/")[2] ?? "overview"} />
      ) : step ? (
        <StepPage d={diagnosis} step={step} n={n} userId={user.id} />
      ) : (
        <Roadmap d={diagnosis} />
      )}
      <NavBar onLogOut={async () => {
        await logOut();
        location.hash = "";
        setUser(null);
      }} />
    </>
  );
}
