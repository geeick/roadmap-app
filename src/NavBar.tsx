export default function NavBar({ onLogOut }: { onLogOut: () => Promise<void> }) {
  return (
    <nav className="app-navbar" aria-label="Main navigation">
      <a href="#/" className="nav-item" aria-label="Roadmap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 19V5l5-2 6 2 5-2v14l-5 2-6-2-5 2Z"/><path d="M9 3v14M15 5v14"/></svg>
        <span>Roadmap</span>
      </a>
      <a href="#/profile" className="nav-item" aria-label="My profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        <span>Profile</span>
      </a>
      <button type="button" className="nav-item" onClick={onLogOut} aria-label="Log out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/></svg>
        <span>Log out</span>
      </button>
    </nav>
  );
}
