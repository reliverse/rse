import { ThemeProvider } from "@/lib/theme";
import { Card, CardContent } from "@/ui/primitives/card";
import { ThemeToggle } from "@/ui/primitives/theme-toggle";

import { APITester } from "./APITester";
import "./index.css";
import logo from "./logo.svg";
import reactLogo from "./react.svg";

function AppContent() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
        />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-muted">
        <CardContent className="pt-6">
          <h1 className="text-5xl font-bold my-4 leading-tight">Rse Web UI</h1>
          <p>
            Edit{" "}
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
              src/App.tsx
            </code>{" "}
            and save to test HMR
          </p>
          <APITester />
        </CardContent>
      </Card>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="rse-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
