import React from "react";
import { T, F } from "../tokens";

interface FriendRowProps {
  initials: string;
  name: string;
  handle: string;
  streak: number;
  preview: string;
  unread?: boolean;
  opacity?: number;
}

const FriendRow: React.FC<FriendRowProps> = ({
  initials,
  name,
  handle,
  streak,
  preview,
  unread = false,
  opacity = 1,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: `1px solid ${T.frame}`,
      opacity,
    }}
  >
    {/* Avatar circle */}
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.surface} 0%, ${T.frame} 100%)`,
        border: `1px solid ${T.frame}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.serif,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 14,
        color: T.inkDim,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontFamily: F.sans,
            fontWeight: 500,
            fontSize: 13,
            color: T.ink,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 8,
            letterSpacing: "1px",
            color: T.inkDim,
          }}
        >
          {handle} · 🔥{streak}
        </span>
      </div>
      <div
        style={{
          fontFamily: F.sans,
          fontWeight: 400,
          fontSize: 11,
          color: T.inkFade,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {preview}
      </div>
    </div>
    {unread && (
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: T.inkBright,
          flexShrink: 0,
        }}
      />
    )}
  </div>
);

export const ScreenCircle: React.FC<{ friendsReveal?: number }> = ({
  friendsReveal = 1,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "0 18px 14px",
    }}
  >
    {/* Header */}
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontFamily: F.serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 26,
          color: T.ink,
        }}
      >
        The Circle
      </div>
    </div>

    {/* Search */}
    <div
      style={{
        height: 32,
        borderRadius: 999,
        border: `1px solid ${T.frame}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        marginBottom: 10,
        fontFamily: F.sans,
        fontWeight: 400,
        fontSize: 11,
        color: T.inkFade,
      }}
    >
      Search…
    </div>

    {/* Friend rows */}
    <FriendRow
      initials="MK"
      name="Maya K"
      handle="@mayak"
      streak={21}
      preview="Three sentences. No more."
      unread
      opacity={Math.min(1, friendsReveal * 2)}
    />
    <FriendRow
      initials="JO"
      name="James O"
      handle="@jamesO"
      streak={8}
      preview="The light was different today."
      opacity={Math.min(1, Math.max(0, friendsReveal * 2 - 1))}
    />
  </div>
);
