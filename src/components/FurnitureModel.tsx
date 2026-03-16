import React from 'react';
import { ItemType, Connections } from '../types';
import { getAdjustedConnections } from '../utils/furnitureUtils';
import { Table } from './furniture/Table';
import { Chair } from './furniture/Chair';
import { CoffeeTable } from './furniture/CoffeeTable';
import { Plant } from './furniture/Plant';
import { Lamp } from './furniture/Lamp';
import { Vase } from './furniture/Vase';
import { Library } from './furniture/Library';
import { FloorLamp } from './furniture/FloorLamp';
import { Laptop } from './furniture/Laptop';
import { Book } from './furniture/Book';
import { TV } from './furniture/TV';
import { Drawer } from './furniture/Drawer';
import { BedsideTable } from './furniture/BedsideTable';
import { Wardrobe } from './furniture/Wardrobe';
import { Bed } from './furniture/Bed';

interface FurnitureModelProps {
  type: ItemType;
  connections?: Connections;
  rotation?: number;
  z?: number;
  variant?: number;
}

export function FurnitureModel({ type, connections, rotation, z, variant }: FurnitureModelProps) {
  const localConn = getAdjustedConnections(connections, rotation);

  switch (type) {
    case 'table':
      return <Table localConn={localConn} variant={variant} />;
    case 'chair':
      return <Chair localConn={localConn} variant={variant} />;
    case 'coffee_table':
      return <CoffeeTable localConn={localConn} variant={variant} />;
    case 'plant':
      return <Plant localConn={localConn} variant={variant} />;
    case 'lamp':
      return <Lamp localConn={localConn} variant={variant} />;
    case 'vase':
      return <Vase localConn={localConn} variant={variant} />;
    case 'library':
      return <Library localConn={localConn} variant={variant} />;
    case 'floor_lamp':
      return <FloorLamp localConn={localConn} variant={variant} />;
    case 'laptop':
      return <Laptop localConn={localConn} variant={variant} />;
    case 'book':
      return <Book localConn={localConn} variant={variant} />;
    case 'tv':
      return <TV localConn={localConn} variant={variant} />;
    case 'drawer':
      return <Drawer localConn={localConn} variant={variant} />;
    case 'bedside_table':
      return <BedsideTable localConn={localConn} variant={variant} />;
    case 'wardrobe':
      return <Wardrobe localConn={localConn} variant={variant} />;
    case 'bed':
      return <Bed localConn={localConn} variant={variant} z={z} />;
    default:
      return null;
  }
}
