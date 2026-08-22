import { Platform } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconShield } from "@/components/icons";

interface ApiVaultTabProps {
  platforms: Platform[];
  authenticated: boolean;
  onToggleSession: () => void;
  userName: string;
  userEmail: string;
}

export function ApiVaultTab({ platforms, authenticated, onToggleSession, userName, userEmail }: ApiVaultTabProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink">Active Session</h3>
            <p className="text-xs text-ink-faint">Single-admin session, JWT-based</p>
          </div>
          <Badge tone={authenticated ? "success" : "neutral"}>{authenticated ? "Session Active" : "Signed Out"}</Badge>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-ink-faint">Owner:</span>
            <span className="font-bold text-ink truncate max-w-[220px]">
              {userName} ({userEmail})
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-ink-faint">Platforms configured:</span>
            <span className="font-mono text-accent">
              0 / {platforms.length} — backend not yet connected
            </span>
          </div>
        </div>

        <Button variant="secondary" onClick={onToggleSession} className="w-full">
          {authenticated ? "Revoke Active Session" : "Re-Authenticate"}
        </Button>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <IconShield className="text-accent" />
          <h3 className="text-sm font-bold text-ink">Platform Credential Vault</h3>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Real API keys/tokens are never stored or rendered in the browser. Once the backend is live, each
          credential below is encrypted (AES-256-GCM) server-side and this panel only ever shows connection
          status — never the raw secret.
        </p>

        <div className="space-y-2">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-inset border border-border">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-xs font-medium text-ink">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">Not Connected</Badge>
                <Button size="sm" variant="ghost" disabled>
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
