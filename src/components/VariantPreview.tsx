import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
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
          <Stage environment={null} intensity={1} shadows={false} adjustCamera={true}>
            <FurnitureModel type={type} variant={variant} rotation={-Math.PI / 4} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
}
