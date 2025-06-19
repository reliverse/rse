import "./index.css";
import { useState } from "react";

const MENU_OPTIONS = [
  { label: "✨ Create a brand new project" },
  { label: "🔬 Create/edit project manually" },
  { label: "🧱 Clone an existing repository" },
  { label: "💬 Chat with Reliverse AI" },
  { label: "🧰 Open developer toolkit" },
  { label: "> 👈 Exit (ctrl+c anywhere)" },
];

export function App() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a23] text-[#cdd6f4] flex items-center justify-center">
      <main className="bg-zinc-900/95 rounded-2xl shadow-2xl border-2 border-violet-700 max-w-3xl w-full mx-auto overflow-hidden">
        <pre className="text-[#cdd6f4] text-shadow-violet-blue px-6 pt-4 pb-2 font-mono text-xs">
          {`╭─ ⠀@reliverse/rse v1.7.8 | bun v1.2.14 | VSCode Terminal | isDev | w93 h14⠀ ─────────────────────────────────────────────⊱`}
        </pre>
        <section className="px-6">
          <div className="font-semibold text-pink-300 tracking-wide my-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 text-[#181825] px-2 py-0.5 rounded shadow">
              ◆
            </span>
            🤖 What would you like to create today? Consider me your versatile
            dev companion!
          </div>
          <div className="text-sky-300 my-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 text-[#181825] px-2 py-0.5 rounded shadow">
              [Ad]
            </span>
            Resend: "Railway is a game changer for us" →
            <a
              href="https://railway.com?referralCode=sATgpf"
              className="text-blue-400 underline hover:text-blue-300 ml-1"
            >
              https://railway.com?referralCode=sATgpf
            </a>
          </div>
          <div className="text-indigo-200 my-2">
            No ads, more power — get Reliverse subscription:
            <a
              href="https://github.com/sponsors/blefnk"
              className="text-blue-400 underline hover:text-blue-300 ml-1"
            >
              https://github.com/sponsors/blefnk
            </a>
          </div>
          <nav aria-label="Main menu" className="mt-6 mb-2">
            <ul className="list-none p-0 m-0">
              {MENU_OPTIONS.map((option, idx) => (
                <li
                  key={option.label}
                  tabIndex={0}
                  className={`transition-all cursor-pointer rounded-md px-2 py-1 outline-none mb-1 font-mono whitespace-pre text-base ${
                    hovered === idx
                      ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-lg text-shadow-cyan-violet"
                      : "hover:bg-gradient-to-r hover:from-violet-500 hover:to-cyan-400 hover:text-white"
                  }`}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(idx)}
                  onBlur={() => setHovered(null)}
                  role="menuitem"
                >
                  {`│ ${option.label}`}
                </li>
              ))}
            </ul>
          </nav>
          <div className="my-6 text-pink-300 flex items-center gap-2">
            │ │{" "}
            <span className="bg-gradient-to-r from-pink-300 to-violet-500 text-[#181825] px-2 py-0.5 rounded shadow">
              ❤️
            </span>{" "}
            Please consider supporting rse development:
            <a
              href="https://github.com/sponsors/blefnk"
              className="text-blue-400 underline hover:text-blue-300 ml-1"
            >
              https://github.com/sponsors/blefnk
            </a>
          </div>
        </section>
        <pre className="text-[#cdd6f4] text-shadow-violet-blue px-6 pt-2 pb-4 font-mono text-xs">
          {`╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────⊱`}
        </pre>
      </main>
    </div>
  );
}

export default App;
