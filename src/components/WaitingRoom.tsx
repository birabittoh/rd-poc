import React, { useEffect, useRef, useState } from 'react';
import { COLORS, PREMADE_MESSAGES, CHAT_COOLDOWN } from '../constants';
import type { ChatMessage } from '../types';

interface WaitingRoomProps {
  users: { name: string; online: boolean }[];
  messages: ChatMessage[];
  currentUser: { uuid: string; name: string } | null;
  releaseTimestamp: string;
  onSendMessage: (messageIndex: number) => void;
  released: boolean;
}

export function WaitingRoom({
  users,
  messages,
  currentUser,
  releaseTimestamp,
  onSendMessage,
  released,
}: WaitingRoomProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState('');
  const [chatCooldown, setChatCooldown] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!releaseTimestamp) return;
    const target = new Date(releaseTimestamp).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      if (diff === 0) {
        setRemaining('00:00:00');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [releaseTimestamp]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (index: number) => {
    if (chatCooldown) return;
    onSendMessage(index);
    setChatCooldown(true);
    setTimeout(() => setChatCooldown(false), CHAT_COOLDOWN * 1000);
  };

  // Sort users: online first, then alphabetically
  const sortedUsers = [...users].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div
      className="flex h-full w-full flex-col font-mono"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: COLORS.DOOR_BORDER + '40' }}
      >
        <h1 className="text-sm font-bold tracking-widest uppercase" style={{ color: COLORS.DOOR_BORDER }}>
          Waiting Room
        </h1>
        {!released && remaining && (
          <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.DOOR_HANDLE }}>
            <span className="opacity-60">opens in</span>
            <span className="font-bold tabular-nums">{remaining}</span>
          </div>
        )}
        {released && (
          <span className="text-sm font-bold animate-pulse" style={{ color: COLORS.WALL }}>
            Opening...
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 && (
              <p className="text-zinc-600 text-xs italic">No messages yet...</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-relaxed break-words">
                {msg.type === 'system' ? (
                  <span className="italic" style={{ color: COLORS.DOOR_BORDER + 'aa' }}>
                    * {msg.text}
                  </span>
                ) : (
                  <span>
                    <span className="font-bold" style={{ color: COLORS.DOOR_HANDLE }}>
                      &lt;{msg.sender}&gt;
                    </span>{' '}
                    <span className="text-zinc-300">{msg.text}</span>
                  </span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Premade message buttons */}
          <div
            className="border-t p-3"
            style={{ borderColor: COLORS.DOOR_BORDER + '40' }}
          >
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2 overflow-x-auto"
              style={{
                borderColor: COLORS.DOOR_BORDER + '30',
                backgroundColor: COLORS.BACKGROUND,
              }}
            >
              {PREMADE_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(i)}
                  disabled={chatCooldown || !currentUser}
                  className="shrink-0 rounded px-3 py-1.5 text-xs transition-all border"
                  style={{
                    borderColor: chatCooldown ? 'transparent' : COLORS.DOOR_BORDER + '30',
                    color: chatCooldown ? '#71717a' : COLORS.DOOR_BORDER,
                    backgroundColor: chatCooldown ? 'transparent' : COLORS.DOOR + '20',
                    cursor: chatCooldown ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!chatCooldown) {
                      e.currentTarget.style.backgroundColor = COLORS.DOOR + '50';
                      e.currentTarget.style.borderColor = COLORS.DOOR;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = chatCooldown
                      ? 'transparent'
                      : COLORS.DOOR + '20';
                    e.currentTarget.style.borderColor = chatCooldown
                      ? 'transparent'
                      : COLORS.DOOR_BORDER + '30';
                  }}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User list sidebar */}
        <div
          className="w-48 shrink-0 border-l flex flex-col"
          style={{ borderColor: COLORS.DOOR_BORDER + '40' }}
        >
          <div
            className="border-b px-3 py-2"
            style={{ borderColor: COLORS.DOOR_BORDER + '40' }}
          >
            <h2
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: COLORS.DOOR_BORDER + '80' }}
            >
              Users ({users.filter((u) => u.online).length}/{users.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sortedUsers.map((user) => (
              <div
                key={user.name}
                className="flex items-center gap-2 rounded px-2 py-1 text-xs"
                style={{
                  color: user.online ? '#e4e4e7' : '#71717a',
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: user.online ? COLORS.WALL : '#52525b',
                  }}
                />
                <span className="truncate">
                  {user.name}
                  {currentUser && user.name === currentUser.name && (
                    <span className="opacity-50"> (you)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
