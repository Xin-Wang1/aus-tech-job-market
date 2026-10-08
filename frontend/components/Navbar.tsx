
import Link from "next/link";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "Roles", href: "/roles" },
  { name: "Compare", href: "/compare" },
  { name: "Skills", href: "/skills" },
  { name: "Locations", href: "/locations" },
];

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          AUS Tech Jobs
        </Link>

        <div className="flex flex-wrap gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-200 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
