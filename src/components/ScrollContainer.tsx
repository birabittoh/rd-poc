import React, { useRef, createContext, useState, useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { View, Environment, Stage } from '@react-three/drei'
import { ItemDefinition } from '../types'
import { FurnitureModel } from './FurnitureModel'

interface PreviewData {
    id: string;
    ref: React.RefObject<HTMLElement | null>;
    item: ItemDefinition;
    variant?: number;
}

interface PreviewContextType {
    register: (data: PreviewData) => void;
    unregister: (id: string) => void;
}

export const PreviewContext = createContext<PreviewContextType | null>(null);

interface ScrollContainerProps {
    children: React.ReactNode
    title: string
}

export function ScrollContainer({ children, title }: ScrollContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [previews, setPreviews] = useState<Map<string, PreviewData>>(new Map());

    const register = useCallback((data: PreviewData) => {
        setPreviews(prev => {
            const next = new Map(prev);
            next.set(data.id, data);
            return next;
        });
    }, []);

    const unregister = useCallback((id: string) => {
        setPreviews(prev => {
            if (!prev.has(id)) return prev;
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const contextValue = useMemo(() => ({ register, unregister }), [register, unregister]);

    return (
        <PreviewContext.Provider value={contextValue}>
            <div ref={containerRef} className="relative w-full overflow-hidden group">
                {/* Section Title */}
                <div className="absolute top-0 left-4 z-20">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                        {title}
                    </span>
                </div>

                {/* Canvas for Previews - Clipped to this container */}
                <div className="absolute inset-0 pointer-events-none z-10" style={{ clipPath: 'inset(0)' }}>
                    <Canvas
                        shadows
                        camera={{ position: [5, 5, 5], fov: 25 }}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: 'transparent' }}
                        eventSource={containerRef as React.MutableRefObject<HTMLElement>}
                    >
                        <ambientLight intensity={0.7} />
                        <Environment preset="city" />

                        {/* Render all registered previews for this container */}
                        {Array.from(previews.values()).map((p) => (
                            <View key={p.id} track={p.ref as React.MutableRefObject<HTMLElement>}>
                                <Stage adjustCamera={true} environment="city" intensity={0.5} center={{}}>
                                    <FurnitureModel
                                        type={p.item.type}
                                        variant={p.variant}
                                        connections={{ top: false, right: false, bottom: false, left: false }}
                                    />
                                </Stage>
                            </View>
                        ))}

                        <View.Port />
                    </Canvas>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-6">
                    <div className="flex items-center gap-3 px-4 md:justify-center min-w-full">
                        {children}
                    </div>
                </div>

                {/* Gradient Fades */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#111] to-transparent pointer-events-none z-20" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#111] to-transparent pointer-events-none z-20" />
            </div>
        </PreviewContext.Provider>
    )
}
