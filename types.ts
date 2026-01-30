
export type RoomType = 'bedroom' | 'toilet' | 'kitchen' | 'living' | 'balcony' | 'storage' | 'corridor';

export interface Dimensions {
  width: number; // in feet (represented as grid units, e.g., 10px = 1ft)
  height: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Door {
  id: string;
  wall: 'top' | 'right' | 'bottom' | 'left';
  offset: number; // Distance from the start of the wall (top-left corner reference)
  width: number; // Door width in units (default 30 = 3ft)
}

export interface Room {
  id: string;
  type: RoomType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  doors: Door[];
}

export interface PlumbingPoint {
  id: string;
  x: number;
  y: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  rooms: Room[];
  plumbingPoints: PlumbingPoint[];
}
