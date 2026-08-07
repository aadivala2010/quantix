/** Quantix the blob. Shows up next to questions and on the finish screen. */
export function Mascot({ size = 72, color = '#58cc02', mood = 'happy' }: {
  size?: number;
  color?: string;
  mood?: 'happy' | 'sad' | 'cheer';
}) {
  const eyeY = mood === 'cheer' ? 40 : 42;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {/* body */}
      <ellipse cx="50" cy="58" rx="38" ry="36" fill={color} />
      {/* belly */}
      <ellipse cx="50" cy="66" rx="26" ry="24" fill="#fff" opacity="0.9" />
      {/* ears / antennae */}
      <circle cx="22" cy="26" r="9" fill={color} />
      <circle cx="78" cy="26" r="9" fill={color} />
      {/* eyes */}
      {mood === 'cheer' ? (
        <>
          <path d="M30 42 q8 -9 16 0" stroke="#4b4b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M54 42 q8 -9 16 0" stroke="#4b4b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="38" cy={eyeY} r="6" fill="#fff" />
          <circle cx="62" cy={eyeY} r="6" fill="#fff" />
          <circle cx="38" cy={eyeY + 1} r="3.2" fill="#4b4b4b" />
          <circle cx="62" cy={eyeY + 1} r="3.2" fill="#4b4b4b" />
        </>
      )}
      {/* mouth */}
      {mood === 'sad' ? (
        <path d="M40 72 q10 -8 20 0" stroke="#4b4b4b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M40 66 q10 10 20 0" stroke="#4b4b4b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/** Speech bubble with a tail on the left, sized to its content. */
export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 rounded-2xl border-2 border-swan px-4 py-3 text-eel">
      <div className="absolute top-6 -left-[10px] h-4 w-4 rotate-45 border-b-2 border-l-2 border-swan bg-white" />
      <div className="relative">{children}</div>
    </div>
  );
}
