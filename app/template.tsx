/**
 * A template re-mounts on every navigation, so this gives each route a short
 * settle-in. It signals "the page changed" on a multi-page site where the
 * header and footer stay put. Pure CSS, and `animation-fill-mode: both` means
 * it can never strand content mid-fade.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
