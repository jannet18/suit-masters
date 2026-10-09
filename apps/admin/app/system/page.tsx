"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import {
  checkAllServices,
  type ServiceHealthResult,
} from "../../lib/health-client";

const POLL_INTERVAL_MS = 15_000;

function formatUptime(seconds?: number): string {
  if (seconds === undefined) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatusBadge({ state }: { state: ServiceHealthResult["state"] }) {
  switch (state) {
    case "up":
      return (
        <Badge className="border-transparent bg-green-600 text-white hover:bg-green-600">
          UP
        </Badge>
      );
    case "down":
    case "unreachable":
      return <Badge variant="destructive">DOWN</Badge>;
    case "unconfigured":
      return <Badge variant="secondary">NOT CONFIGURED</Badge>;
  }
}

export default function SystemHealthPage() {
  const [results, setResults] = useState<ServiceHealthResult[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await checkAllServices();
      setResults(data);
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const upCount = results?.filter((r) => r.state === "up").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">System Health</h1>
          <p className="text-muted-foreground text-sm">
            {results
              ? `${upCount} / ${results.length} services healthy`
              : "Checking service health..."}
            {lastUpdated &&
              ` · last checked ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(results ?? []).map((result) => (
          <Card key={result.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">
                  {result.name.replace(/-/g, " ")}
                </CardTitle>
                <StatusBadge state={result.state} />
              </div>
              <CardDescription>
                {result.state === "unconfigured"
                  ? "No URL configured for this environment"
                  : result.error || "Readiness probe (/health)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency</span>
                <span>
                  {result.latencyMs !== null ? `${result.latencyMs}ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span>{formatUptime(result.uptimeSeconds)}</span>
              </div>
              {result.checks &&
                Object.entries(result.checks).map(([name, status]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {name}
                    </span>
                    <span
                      className={
                        status === "up" ? "text-green-600" : "text-destructive"
                      }
                    >
                      {status}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
