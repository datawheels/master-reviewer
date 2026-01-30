import Link from "next/link";

export default function AppNav() {
  const items = [
    { href: "/practice", label: "Practice" },
    { href: "/topics", label: "Topics" },
    { href: "/history", label: "History" },
    { href: "/bookmarks", label: "Bookmarks" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
        <div className="font-semibold tracking-tight">Master Reviewer</div>
        <nav className="flex gap-4 text-sm text-neutral-300">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="hover:text-neutral-50">
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
