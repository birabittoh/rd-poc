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
  const [frameCounter, setFrameCounter] = useState(0);
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

    // Wait for 3 frames for each variant to ensure Stage has adjusted and components are mounted
    if (frameCounter < 3) {
      const timeout = setTimeout(() => {
        setFrameCounter((c) => c + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }

    const { type, variant } = allVariants[currentIndex];

    gl.render(scene, camera);
    const dataURL = gl.domElement.toDataURL('image/png');
    captures.current[`${type}_${variant}`] = dataURL;
    onProgress((currentIndex + 1) / allVariants.length);

    setFrameCounter(0);
    setCurrentIndex((prev) => prev + 1);
  }, [
    currentIndex,
    frameCounter,
    allVariants,
    gl,
    scene,
    camera,
    onComplete,
    onProgress,
  ]);

  if (currentIndex >= allVariants.length) return null;

  const { type, variant } = allVariants[currentIndex];

  return (
    <Stage
      environment={null}
      intensity={3.5}
      shadows={false}
      adjustCamera={2.2}
      center={{}}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <group rotation={[0, Math.PI / 4, 0]}>
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
