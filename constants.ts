import { RoomType } from './types';

// Grid Configuration
export const GRID_SIZE = 10; // 1 unit = 1 foot (conceptually) -> 10px on screen at scale 1
export const SCALE_FACTOR = 1; 
export const WALL_THICKNESS = 7.5; // 9 inches = 0.75 feet. 0.75 * 10px = 7.5px

// Validation Config
export const PLUMBING_TOLERANCE = 150; // Distance in units

// Colors
export const ROOM_COLORS: Record<RoomType, { bg: string; border: string; text: string }> = {
  bedroom: { bg: '#bae6fd', border: '#0284c7', text: '#0369a1' }, // sky-200 / sky-600
  toilet: { bg: '#bbf7d0', border: '#16a34a', text: '#15803d' }, // green-200 / green-600
  kitchen: { bg: '#fde047', border: '#ca8a04', text: '#a16207' }, // yellow-300 / yellow-600
  living: { bg: '#fed7aa', border: '#ea580c', text: '#c2410c' }, // orange-200 / orange-600
  balcony: { bg: '#e2e8f0', border: '#64748b', text: '#475569' }, // slate-200 / slate-500
  storage: { bg: '#e5e7eb', border: '#9ca3af', text: '#4b5563' }, // gray-200
  corridor: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
};

// Initial Data for "Import" Simulation - Matches the complex image provided
export const DEMO_FLOOR_PLAN = {
  id: 'demo-complex-1',
  name: 'Complex Apartment Layout',
  width: 800,
  height: 1200,
  plumbingPoints: [
    { id: 'p1', x: 80, y: 250 }, // Near Master Bath
    { id: 'p2', x: 330, y: 180 }, // Near Upper Toilet
    { id: 'p3', x: 430, y: 300 }, // Near Upper Kitchen
    { id: 'p4', x: 80, y: 880 }, // Near Lower Toilet
    { id: 'p5', x: 200, y: 950 }, // Near Lower Kitchen
  ],
  rooms: [
    // --- Upper Section ---
    // Top Balconies
    { id: 'r1', type: 'balcony', label: 'New Balcony', x: 50, y: 50, width: 160, height: 60, rotation: 0, doors: [] },
    { id: 'r2', type: 'balcony', label: 'New Balcony', x: 300, y: 50, width: 100, height: 80, rotation: 0, doors: [] },
    
    // Master Suite Block (Left)
    { id: 'r3', type: 'storage', label: 'Dressing', x: 50, y: 120, width: 60, height: 100, rotation: 0, doors: [] },
    { id: 'r4', type: 'bedroom', label: 'Master Bed', x: 120, y: 120, width: 170, height: 210, rotation: 0, doors: [] },
    { id: 'r5', type: 'toilet', label: 'Master Bath', x: 50, y: 230, width: 60, height: 100, rotation: 0, doors: [] },
    { id: 'r5b', type: 'balcony', label: 'Balcony', x: 50, y: 340, width: 60, height: 200, rotation: 0, doors: [] }, 

    // Service Block (Right of Master)
    { id: 'r6', type: 'toilet', label: 'New Toilet', x: 300, y: 140, width: 60, height: 80, rotation: 0, doors: [] },
    { id: 'r7', type: 'storage', label: 'Store', x: 370, y: 140, width: 60, height: 80, rotation: 0, doors: [] },
    { id: 'r8', type: 'kitchen', label: 'Kitchen', x: 370, y: 230, width: 120, height: 140, rotation: 0, doors: [] },
    { id: 'r9', type: 'living', label: 'New Living', x: 300, y: 380, width: 190, height: 140, rotation: 0, doors: [] }, 

    // Mid Section (Below Master)
    { id: 'r11', type: 'bedroom', label: 'Bedroom 2', x: 120, y: 340, width: 170, height: 140, rotation: 0, doors: [] },
    { id: 'r12', type: 'bedroom', label: 'New Bedroom', x: 140, y: 490, width: 150, height: 120, rotation: 0, doors: [] },
    { id: 'r13', type: 'living', label: 'Living Room', x: 300, y: 530, width: 140, height: 120, rotation: 0, doors: [] },
    
    // --- Corridor ---
    { id: 'r14', type: 'corridor', label: 'New Corridor', x: 100, y: 660, width: 450, height: 80, rotation: 0, doors: [] },
    
    // --- Lower Section ---
    // Left Block
    { id: 'r15', type: 'balcony', label: 'New Balcony', x: 50, y: 760, width: 100, height: 80, rotation: 0, doors: [] },
    { id: 'r16', type: 'toilet', label: 'New Toil', x: 60, y: 850, width: 80, height: 60, rotation: 0, doors: [] },
    { id: 'r20', type: 'balcony', label: 'New Balcony', x: 50, y: 920, width: 100, height: 150, rotation: 0, doors: [] },

    // Center Block
    { id: 'r17', type: 'bedroom', label: 'New Bedroom', x: 160, y: 760, width: 140, height: 140, rotation: 0, doors: [] },
    { id: 'r21', type: 'kitchen', label: 'New Kitchen', x: 160, y: 910, width: 140, height: 120, rotation: 0, doors: [] },
    { id: 'r23', type: 'toilet', label: 'New Toil', x: 310, y: 910, width: 60, height: 60, rotation: 0, doors: [] },
    { id: 'r24', type: 'storage', label: 'Store', x: 380, y: 910, width: 60, height: 60, rotation: 0, doors: [] },

    // Right Block
    { id: 'r18', type: 'living', label: 'New Living', x: 310, y: 760, width: 180, height: 140, rotation: 0, doors: [] },
    { id: 'r22', type: 'bedroom', label: 'New Bedroom', x: 450, y: 910, width: 120, height: 120, rotation: 0, doors: [] },
    { id: 'r19', type: 'balcony', label: 'New Balcony', x: 500, y: 760, width: 60, height: 250, rotation: 0, doors: [] },
  ] as any[],
};