import React, { useRef, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Ballerina } from '../types';
import { TILE_SIZE } from '../constants';

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function BallerinaGLB() {
  const { scene } = useGLTF('/ballerina.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={2} position={[0, 1, 0]} />;
}

function BallerinaPrimitive() {
  const skinColor = "#fce2d5";
  const hairColor = "#b084cc";
  const shirtColor = "#f4c2d7";
  const skirtColor = "#3d4b68";
  const shoeColor = "#2c2b5e";
  const eyeColor = "#5c3a21";

  return (
    <group scale={0.32} position={[0, 0.11, 0]}>
      <group position={[0, 2.5, 0]}>
        {/* Head */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.1, 1.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.25, 0.1, 0.61]} receiveShadow>
          <boxGeometry args={[0.2, 0.3, 0.05]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.61]} receiveShadow>
          <boxGeometry args={[0.2, 0.3, 0.05]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
        {/* Blush */}
        <mesh position={[-0.4, -0.1, 0.61]} receiveShadow>
          <boxGeometry args={[0.15, 0.1, 0.05]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
        <mesh position={[0.4, -0.1, 0.61]} receiveShadow>
          <boxGeometry args={[0.15, 0.1, 0.05]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.2, 0.61]} receiveShadow>
          <boxGeometry args={[0.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Hair Base */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.4, 1.3]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0, 0, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.4, 0.2]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.6, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1.0, 1.3]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.6, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1.0, 1.3]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        {/* Pigtails */}
        <mesh position={[-0.8, -0.2, -0.2]} rotation={[0, 0, Math.PI - 0.5]} castShadow receiveShadow>
          <coneGeometry args={[0.3, 1.2, 4]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.8, -0.2, -0.2]} rotation={[0, 0, -(Math.PI - 0.5)]} castShadow receiveShadow>
          <coneGeometry args={[0.3, 1.2, 4]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
      </group>
      {/* Neck */}
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Torso (Shirt) */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Shirt Logo (Cat) */}
      <mesh position={[0, 1.5, 0.36]} receiveShadow>
        <boxGeometry args={[0.25, 0.2, 0.05]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Belt/Waist */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.38, 0.15, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Belt Buckle (Heart) */}
      <mesh position={[0, 0.95, 0.38]} rotation={[0, 0, Math.PI / 4]} receiveShadow>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#800080" />
      </mesh>
      {/* Skirt */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.6, 0.4, 12]} />
        <meshStandardMaterial color={skirtColor} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.25, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.25, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Leg Warmers */}
      <mesh position={[-0.25, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <mesh position={[0.25, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 8]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Shoes */}
      <group position={[-0.25, -0.2, 0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.35, 0.3, 0.5]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.1, 0.52]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      <group position={[0.25, -0.2, 0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.35, 0.3, 0.5]} />
          <meshStandardMaterial color={shoeColor} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.1, 0.52]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      {/* Arms */}
      <mesh position={[-0.55, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.55, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.7, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.7, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <ContactShadows position={[0, -0.39, 0]} opacity={0.5} scale={5} blur={2} far={4} />
    </group>
  );
}

export function BallerinaModel({ ballerina }: { ballerina: Ballerina }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Interpolate position
    const targetX = ballerina.targetX * TILE_SIZE + TILE_SIZE / 2;
    const targetZ = ballerina.targetY * TILE_SIZE + TILE_SIZE / 2;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      5 * delta
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      5 * delta
    );

    // Look at target if moving
    if (
      Math.abs(targetX - groupRef.current.position.x) > 0.01 ||
      Math.abs(targetZ - groupRef.current.position.z) > 0.01
    ) {
      const angle = Math.atan2(
        targetX - groupRef.current.position.x,
        targetZ - groupRef.current.position.z
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        10 * delta
      );
    }

    // Dance animation
    if (ballerina.isDancing) {
      groupRef.current.rotation.y += delta * 4;
      timeRef.current += delta;
      groupRef.current.position.y = Math.abs(Math.sin(timeRef.current * 8)) * 0.2;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        10 * delta
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        ballerina.x * TILE_SIZE + TILE_SIZE / 2,
        0,
        ballerina.y * TILE_SIZE + TILE_SIZE / 2,
      ]}
    >
      <ErrorBoundary fallback={<BallerinaPrimitive />}>
        <Suspense fallback={<BallerinaPrimitive />}>
          <BallerinaGLB />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}
