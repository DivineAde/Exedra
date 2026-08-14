export function EditorLayout({ children }: { children: React.ReactNode }) {
  // `h-dvh` (dynamic viewport height) rather than `h-screen` (100vh) --
  // on mobile Safari/Chrome, 100vh includes space behind the collapsing
  // address bar, which either clips the bottom toolbar or causes a jump
  // as the chrome shows/hides. `h-dvh` tracks the *actual* visible
  // viewport. Tailwind 3.4+ ships this utility natively; unsupported
  // browsers simply ignore the declaration and nothing breaks.
  return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>;
}
