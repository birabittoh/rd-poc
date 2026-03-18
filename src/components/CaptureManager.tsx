import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stage, useGLTF } from '@react-three/drei';
import { ITEM_DEFINITIONS } from '../items';
import { FurnitureModel } from './FurnitureModel';
import { ItemType } from '../types';

interface CaptureManagerProps {
  onComplete: (captures: Record<string, string>) => void;
  onProgress: (progress: number) => void;
}

function CaptureInternal({
  onComplete,
  onProgress,
}: {
  onComplete: (captures: Record<string, string>) => void;
  onProgress: (progress: number) => void;
}) {
  const { gl, scene, camera } = useThree();
  const [currentIndex, setCurrentIndex] = useState(0);
  const captures = useRef<Record<string, string>>({});

  const allVariants = React.useMemo(() => {
    const list: { type: ItemType; variant: number }[] = [];
    Object.values(ITEM_DEFINITIONS).forEach((def) => {
      for (let i = 0; i < (def.variants || 1); i++) {
        list.push({ type: def.type, variant: i });
      }
    });
    return list;
  }, []);

  useEffect(() => {
    if (currentIndex >= allVariants.length) {
      onComplete(captures.current);
      return;
    }

    const { type, variant } = allVariants[currentIndex];

    // Wait for a frame to ensure rendering is complete
    const timeout = setTimeout(() => {
      gl.render(scene, camera);
      const dataURL = gl.domElement.toDataURL('image/png');
      captures.current[`${type}_${variant}`] = dataURL;
      onProgress((currentIndex + 1) / allVariants.length);
      setCurrentIndex((prev) => prev + 1);
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentIndex, allVariants, gl, scene, camera, onComplete, onProgress]);

  if (currentIndex >= allVariants.length) return null;

  const { type, variant } = allVariants[currentIndex];

  return (
    <Stage environment={null} intensity={1} shadows={false} adjustCamera={1.5} center={{}}>
      <group rotation={[0, Math.PI / 4, 0]}>
        <FurnitureModel type={type} variant={variant} />
      </group>
    </Stage>
  );
}

function AssetPreloader() {
  useGLTF.preload('/ballerina.glb');
  return null;
}

export function CaptureManager({ onComplete, onProgress }: CaptureManagerProps) {
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
        camera={{ position: [3, 3, 3], fov: 40 }}
      >
        <Suspense fallback={null}>
          <AssetPreloader />
          <CaptureInternal onComplete={onComplete} onProgress={onProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
