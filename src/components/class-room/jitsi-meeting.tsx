"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";

// Jitsi meeting embed via Jitsi's External API.
// - With `jaas` (JaaS keys configured): joins on 8x8.vc with a signed JWT, so
//   the class's teacher is the moderator. No embed cutoff there.
// - Without it: public meet.jit.si, auto-rejoining on its free 5-minute embed
//   cutoff so the user sees a ~2s reconnect instead of a hard disconnect.
type JitsiApi = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  dispose: () => void;
  executeCommand: (cmd: string, ...args: unknown[]) => void;
};
type JitsiApiCtor = new (
  domain: string,
  options: Record<string, unknown>
) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

export function JitsiMeeting({
  jitsiRoomName,
  displayName,
  jaas,
  onHangup,
  onRejoin,
}: {
  jitsiRoomName: string;
  displayName: string;
  jaas?: { appId: string; jwt: string } | null;
  // JaaS only: the user hung up / clicked Rejoin. Not called for the
  // meet.jit.si embed cutoff, which rejoins by itself.
  onHangup?: () => void;
  onRejoin?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<JitsiApi | null>(null);
  const onHangupRef = React.useRef(onHangup);
  onHangupRef.current = onHangup;
  const [version, setVersion] = React.useState(0);
  const [reconnecting, setReconnecting] = React.useState(false);
  // JaaS only: the user hung up and sees a Rejoin button instead of auto-rejoin
  const [left, setLeft] = React.useState(false);
  const appId = jaas?.appId;
  const jwt = jaas?.jwt;

  React.useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    function loadScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-jitsi="external-api"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () =>
            reject(new Error("Jitsi script failed"))
          );
          return;
        }
        const s = document.createElement("script");
        s.src = appId
          ? `https://8x8.vc/${appId}/external_api.js`
          : "https://meet.jit.si/external_api.js";
        s.async = true;
        s.dataset.jitsi = "external-api";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Jitsi script failed"));
        document.body.appendChild(s);
      });
    }

    (async () => {
      try {
        await loadScript();
        if (cancelled || !container || !window.JitsiMeetExternalAPI) return;
        const api = new window.JitsiMeetExternalAPI(appId ? "8x8.vc" : "meet.jit.si", {
          roomName: appId ? `${appId}/${jitsiRoomName}` : jitsiRoomName,
          ...(jwt ? { jwt } : {}),
          parentNode: container,
          width: "100%",
          height: "100%",
          userInfo: { displayName },
          configOverwrite: {
            // Older and newer Jitsi spellings of "skip the Join meeting screen"
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithVideoMuted: false,
            disableDeepLinking: true,
            requireDisplayName: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
          },
        });
        apiRef.current = api;
        api.addEventListener("readyToClose", () => {
          if (cancelled) return;
          // JaaS has no embed cutoff, so this only fires when the user hangs up
          if (appId) {
            setLeft(true);
            onHangupRef.current?.();
            return;
          }
          setReconnecting(true);
          setTimeout(() => {
            if (cancelled) return;
            setVersion((v) => v + 1);
          }, 1500);
        });
      } catch (e) {
        console.error("[jitsi-meeting] load failed", e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        apiRef.current?.dispose();
      } catch {
        /* ignore */
      }
      apiRef.current = null;
      if (container) container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, jitsiRoomName, displayName, appId, jwt]);

  React.useEffect(() => {
    if (reconnecting) {
      const t = setTimeout(() => setReconnecting(false), 4000);
      return () => clearTimeout(t);
    }
  }, [reconnecting, version]);

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {left && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/80 text-white">
          <div className="text-center">
            <p className="text-sm font-semibold">You left the class</p>
            <button
              onClick={() => {
                setLeft(false);
                setVersion((v) => v + 1);
                onRejoin?.();
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-white/90"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Rejoin
            </button>
          </div>
        </div>
      )}
      {reconnecting && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded-full bg-black/70 text-white px-4 py-2 text-xs font-semibold backdrop-blur">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Reconnecting…
        </div>
      )}
      <button
        onClick={() => setVersion((v) => v + 1)}
        title="Reconnect meeting"
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 text-[11px] font-semibold backdrop-blur"
      >
        <RefreshCw className="h-3 w-3" /> Reconnect
      </button>
    </>
  );
}
