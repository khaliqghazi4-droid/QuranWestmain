"use client";

import * as React from "react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";

// Mounts Daily.co's prebuilt UI into a container and joins the given room URL.
export function DailyMeeting({
  url,
  displayName,
  onLeft,
}: {
  url: string;
  displayName: string;
  // The user left the call with Daily's Leave button
  onLeft?: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const callRef = React.useRef<DailyCall | null>(null);
  const onLeftRef = React.useRef(onLeft);
  onLeftRef.current = onLeft;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Daily can only have one call frame on the page at a time; if a leftover
    // instance exists (e.g. from a fast back/forward navigation) destroy it
    // before mounting a new one.
    try {
      const existing = DailyIframe.getCallInstance?.();
      if (existing) existing.destroy();
    } catch {
      /* ignore */
    }

    const call = DailyIframe.createFrame(container, {
      iframeStyle: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "0",
      },
      showLeaveButton: true,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: true,
    });
    callRef.current = call;
    call.on("left-meeting", () => onLeftRef.current?.());

    call
      .join({ url, userName: displayName })
      .catch((e) => console.error("[daily-meeting] join failed", e));

    return () => {
      try {
        call.destroy();
      } catch {
        /* ignore */
      }
      callRef.current = null;
    };
    // url + displayName are stable for the lifetime of this mount; we don't
    // want to tear down the call on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
