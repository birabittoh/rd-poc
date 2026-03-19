import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stage, useGLTF } from '@react-three/drei';
import { ITEM_DEFINITIONS } from '../items';
import { FurnitureModel } from './FurnitureModel';
import { ItemType } from '../types';

interface CaptureManagerProps {
  onComplete: (captures: Record<string, string>) => void;
  onProgress: (progress: number) => void;
  onCurrentItem?: (label: string, current: number, total: number) => void;
}

function CaptureInternal({
  onComplete,
  onProgress,
  onCurrentItem,
}: {
  onComplete: (captures: Record<string, string>) => void;
  onProgress: (progress: number) => void;
  onCurrentItem?: (label: string, current: number, total: number) => void;
}) {
  const { gl, scene, camera } = useThree();
  const [currentIndex, setCurrentIndex] = useState(0);
  const captures = useRef<Record<string, string>>({});
  const capturedUpTo = useRef(-1);

  const allVariants = React.useMemo(() => {
    const list: { type: ItemType; variant: number }[] = [];
    Object.values(ITEM_DEFINITIONS).forEach((def) => {
      for (let i = 0; i < (def.variants || 1); i++) {
        list.push({ type: def.type, variant: i });
      }
    });
    return list;
  }, []);

  useFrame(() => {
    if (currentIndex >= allVariants.length) return;
    if (capturedUpTo.current >= currentIndex) return;
    capturedUpTo.current = currentIndex;

    const { type, variant } = allVariants[currentIndex];

    const def = ITEM_DEFINITIONS[type];
    const label = def.label ?? type.replace(/_/g, ' ');
    onCurrentItem?.(label, currentIndex + 1, allVariants.length);

    gl.render(scene, camera);
    const dataURL = gl.domElement.toDataURL('image/png');
    captures.current[`${type}_${variant}`] = dataURL;
    onProgress((currentIndex + 1) / allVariants.length);

    if (currentIndex + 1 >= allVariants.length) {
      onComplete(captures.current);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  });

  if (currentIndex >= allVariants.length) return null;

  const { type, variant } = allVariants[currentIndex];
  const adjustCamera = ITEM_DEFINITIONS[type].previewAdjustCamera ?? 1.2;

  return (
    <Stage
      environment={null}
      intensity={1.0}
      shadows={false}
      adjustCamera={adjustCamera}
      center={{}}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <group>
        <FurnitureModel
          type={type}
          variant={variant}
          connections={{ top: false, right: false, bottom: false, left: false }}
        />
      </group>
    </Stage>
  );
}

function AssetPreloader() {
  useGLTF.preload(`${import.meta.env.BASE_URL}ballerina.glb`);
  return null;
}

export function CaptureManager({ onComplete, onProgress, onCurrentItem }: CaptureManagerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -1000,
        left: -1000,
        width: 128,
        height: 128,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ position: [3, 2.5, 2], fov: 40 }}
      >
        <Suspense fallback={null}>
          <AssetPreloader />
          <CaptureInternal
            onComplete={onComplete}
            onProgress={onProgress}
            onCurrentItem={onCurrentItem}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
