import React, { Suspense } from 'react';
import { Stage, View } from '@react-three/drei';
import { FurnitureModel } from './FurnitureModel';
import { ItemType } from '../types';

export function VariantPreview({ type, variant }: { type: ItemType; variant: number }) {
  return (
    <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden pointer-events-none relative">
      <View className="w-full h-full">
        <Suspense fallback={null}>
          <Stage environment={null} intensity={1} shadows={false} adjustCamera={1.5}>
            <group rotation={[0, Math.PI / 4, 0]}>
              <FurnitureModel type={type} variant={variant} />
            </group>
          </Stage>
        </Suspense>
      </View>
    </div>
  );
}
