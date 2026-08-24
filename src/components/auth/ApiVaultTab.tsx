"use client";

import { useState } from "react";
import { Platform } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconShield } from "@/components/icons";
import { PlatformIcon } from "@/components/platform-icons";
import { ConfigureCredentialsModal } from "./ConfigureCredentialsModal";
import { api } from "@/lib/api-client";

interface ApiVaultTabProps {
  platforms: Platform[];
  userEmail: string;
  onLogout: () => void;
  onCredentialsChanged: () => void;
  onError: (message: string) => void;
}

export function ApiVaultTab({ platforms, userEmail, onLogout, onCredentialsChanged, onError }: ApiVaultTabProps) {
  const [configuring, setConfiguring] = useState<Platform | null>(null);
  const connectedCount = platforms.filter((p) => p.connected).length;

  const handleDisconnect = async (platformId: string) => {
    try {
      await api.removeCredentials(platformId);
      onCredentialsChanged();
    } catch (err) {
      onError((err as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-ink">Active Session</h3>
            <p className="text-xs text-ink-faint">Single-admin session, JWT-based</p>
          </div>
          <Badge tone="success">Session Active</Badge>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-ink-faint">Signed in as:</span>
            <span className="font-bold text-ink truncate max-w-[220px]">{userEmail}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-ink-faint">Platforms configured:</span>
            <span className="font-mono text-accent">
              {connectedCount} / {platforms.length}
            </span>
          </div>
        </div>

        <Button variant="secondary" onClick={onLogout} className="w-full">
          Sign Out
        </Button>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <IconShield className="text-accent" />
          <h3 className="text-sm font-bold text-ink">Platform Credential Vault</h3>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Real API keys/tokens are never rendered back in the browser. Every credential below is
          encrypted (AES-256-GCM) server-side — this panel only ever shows connection status.
        </p>

        <div className="space-y-2">
          {platforms.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-inset border border-border">
              <div className="flex items-center gap-2.5">
                <PlatformIcon id={p.id} className="w-5 h-5 text-ink-muted" />
                <span className="text-xs font-medium text-ink">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.connected ? "success" : "neutral"}>
                  {p.connected ? "Connected" : "Not Connected"}
                </Badge>
                {p.connected ? (
                  <Button size="sm" variant="ghost" onClick={() => handleDisconnect(p.id)}>
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setConfiguring(p)}>
                    Configure
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {configuring && (
        <ConfigureCredentialsModal
          platform={configuring}
          onClose={() => setConfiguring(null)}
          onSave={async (values) => {
            await api.saveCredentials(configuring.id, values);
            onCredentialsChanged();
          }}
        />
      )}
    </div>
  );
}
