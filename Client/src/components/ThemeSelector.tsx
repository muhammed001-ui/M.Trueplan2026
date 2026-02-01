import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "earth", name: "Earth (Gray & Brown)", color: "bg-[#8B7355]" },
    { id: "neon", name: "Neon (Purple & Black)", color: "bg-[#9d4edd]" },
    { id: "vampire", name: "Vampire (Red & Black)", color: "bg-[#d00000]" },
    { id: "minimal", name: "Minimal (White & Dark)", color: "bg-[#1a1a1a]" },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:shadow-md transition-all">
          <Palette className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Select Theme
        </div>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground",
              theme === t.id && "bg-accent/50"
            )}
          >
            <div className={cn("w-6 h-6 rounded-full border border-border/20 shadow-sm", t.color)} />
            <span className="flex-1 font-medium">{t.name}</span>
            {theme === t.id && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
