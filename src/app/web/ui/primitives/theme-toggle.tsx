import { Moon, Sun, Monitor } from "lucide-react";

import { useTheme } from "@/lib/theme";

import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system" as const,
      label: "System",
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme?.icon ?? Monitor;

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex]?.value ?? "system");
        }}
      >
        <Icon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <div className="absolute right-0 top-full mt-2 w-32 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <button
              key={themeOption.value}
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                theme === themeOption.value
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground"
              }`}
              onClick={() => setTheme(themeOption.value)}
            >
              <ThemeIcon className="h-4 w-4" />
              {themeOption.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
