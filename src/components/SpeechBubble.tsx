import { Html } from '@react-three/drei';
import { EMOTION_EMOJI, type Dialogue } from '../phases';

export function SpeechBubble({ dialogue }: { dialogue: Dialogue }) {
  const emoji = EMOTION_EMOJI[dialogue.emotion];

  return (
    <group position={[0, 2.5, 0]}>
      <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="relative bg-white/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg border border-zinc-200 max-w-[200px] min-w-[100px] text-center whitespace-normal">
          {emoji && (
            <span className="absolute -top-3 -left-2 text-lg drop-shadow-sm">{emoji}</span>
          )}
          <p className="text-sm text-zinc-800 font-medium leading-snug">{dialogue.content}</p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/95" />
        </div>
      </Html>
    </group>
  );
}
