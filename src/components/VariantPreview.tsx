import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Stage } from "@react-three/drei";
import { FurnitureModel } from "./FurnitureModel";
import { ItemType } from "../types";

export function VariantPreview({ type, variant }: { type: ItemType; variant: number }) {
  return (
    <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], fov: 40 }}
        style={{ width: "64px", height: "64px" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <pointLight position={[5, 5, 5]} intensity={2} />
          <Center>
            <FurnitureModel type={type} variant={variant} rotation={-Math.PI / 4} />
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
}
