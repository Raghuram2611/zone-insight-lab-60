import { Button } from "./ui/button";
import { LogOut, Settings, User } from "lucide-react";

interface TopHeaderProps {
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export function TopHeader({ user = { name: "Admin", role: "Administrator" }, onLogout }: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-primary">Smart Store Analytics</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{user.name}</span>
            <span className="text-muted-foreground">({user.role})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}