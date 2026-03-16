import { Connections } from '../types';

export function getAdjustedConnections(
  connections: Connections | undefined,
  rotation: number | undefined
): Connections {
  const conn = connections || { top: false, right: false, bottom: false, left: false };
  const rotIndex = Math.round((rotation || 0) / (Math.PI / 2));
  const normalizedRot = ((rotIndex % 4) + 4) % 4;

  if (normalizedRot === 1) {
    return { top: conn.left, right: conn.top, bottom: conn.right, left: conn.bottom };
  } else if (normalizedRot === 2) {
    return { top: conn.bottom, right: conn.left, bottom: conn.top, left: conn.right };
  } else if (normalizedRot === 3) {
    return { top: conn.right, right: conn.bottom, bottom: conn.left, left: conn.top };
  }

  return { ...conn };
}
