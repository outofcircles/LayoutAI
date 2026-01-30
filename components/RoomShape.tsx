import React from 'react';
import { Room, PlumbingPoint, Door } from '../types';
import { ROOM_COLORS, WALL_THICKNESS } from '../constants';
import { checkOverlap, isPlumbingValid, formatArea } from '../utils/geometry';

interface RoomShapeProps {
  room: Room;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, roomId: string, handle?: string) => void;
  allRooms: Room[];
  plumbingPoints: PlumbingPoint[];
}

const RoomShape: React.FC<RoomShapeProps> = ({ 
  room, 
  isSelected, 
  onMouseDown, 
  allRooms,
  plumbingPoints
}) => {
  const colors = ROOM_COLORS[room.type];
  
  // Validation checks
  const isOverlapping = allRooms.some(r => r.id !== room.id && checkOverlap(room, r));
  const isPlumbingIssue = !isPlumbingValid(room, plumbingPoints);
  const hasError = isOverlapping || isPlumbingIssue;

  const handleStyle = { fill: '#3b82f6', stroke: 'white', strokeWidth: 1 };

  // Calculate Feet
  const widthFt = (room.width / 10).toFixed(1);
  const heightFt = (room.height / 10).toFixed(1);

  // Render Door
  const renderDoor = (door: Door) => {
    let x = 0, y = 0, w = 0, h = 0;
    let rotation = 0;

    switch(door.wall) {
        case 'top':
            x = door.offset;
            y = -WALL_THICKNESS / 2;
            w = door.width;
            h = WALL_THICKNESS;
            rotation = 0;
            break;
        case 'bottom':
            x = door.offset;
            y = room.height - WALL_THICKNESS / 2;
            w = door.width;
            h = WALL_THICKNESS;
            rotation = 180;
            break;
        case 'left':
            x = -WALL_THICKNESS / 2;
            y = door.offset;
            w = WALL_THICKNESS;
            h = door.width;
            rotation = 270;
            break;
        case 'right':
            x = room.width - WALL_THICKNESS / 2;
            y = door.offset;
            w = WALL_THICKNESS;
            h = door.width;
            rotation = 90;
            break;
    }

    return (
        <g key={door.id}>
            {/* Masking Rect (Hole in Wall) */}
            <rect 
                x={x} 
                y={y} 
                width={w} 
                height={h} 
                fill={colors.bg}
                stroke="none"
            />
            {/* Door Leaf Symbol */}
            <g transform={`translate(${x + (door.wall === 'left' || door.wall === 'right' ? w/2 : 0)}, ${y + (door.wall === 'top' || door.wall === 'bottom' ? h/2 : 0)}) rotate(${rotation})`}>
                 {/* Hinge point is 0,0 relative to this transform */}
                 {/* Depending on rotation logic, we draw a line and arc */}
                 {door.wall === 'top' && (
                    <>
                     <line x1={0} y1={h/2} x2={0} y2={-w} stroke="#8B4513" strokeWidth="2" />
                     <path d={`M 0 ${h/2} Q ${w} ${h/2} ${w} ${-w/2}`} fill="none" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
                    </>
                 )}
                 {door.wall === 'bottom' && (
                    <>
                     <line x1={w} y1={-h/2} x2={w} y2={w} stroke="#8B4513" strokeWidth="2" />
                    </>
                 )}
                 {/* Simplified generic door line for all orientations given the complexity of transforms */}
                 {/* Vertical walls */}
                 {(door.wall === 'left' || door.wall === 'right') && (
                     <line x1={0} y1={0} x2={-30} y2={-15} stroke="#8B4513" strokeWidth="2" />
                 )}
                  {/* Horizontal walls */}
                 {(door.wall === 'top' || door.wall === 'bottom') && (
                     <line x1={0} y1={0} x2={door.width * 0.9} y2={-door.width * 0.9} stroke="#8B4513" strokeWidth="2" />
                 )}
                 <path 
                    d={`M 0 0 A ${door.width} ${door.width} 0 0 0 ${door.width} ${-door.width}`} 
                    fill="none" 
                    stroke="#8B4513" 
                    strokeWidth="1" 
                    strokeOpacity="0.3"
                 />
            </g>
        </g>
    );
  }

  return (
    <g
      transform={`translate(${room.x}, ${room.y}) rotate(${room.rotation}, ${room.width / 2}, ${room.height / 2})`}
      onMouseDown={(e) => onMouseDown(e, room.id)}
      style={{ cursor: isSelected ? 'move' : 'pointer' }}
    >
      {/* Main Room Body */}
      <rect
        width={room.width}
        height={room.height}
        fill={hasError ? '#fee2e2' : colors.bg}
        stroke={hasError ? '#ef4444' : isSelected ? '#2563eb' : colors.border}
        strokeWidth={WALL_THICKNESS}
        strokeLinejoin="round"
        rx={0} 
        className="transition-colors duration-200"
      />

      {/* Render Doors */}
      {room.doors?.map(renderDoor)}

      {/* Grid pattern overlay for better scale visualization */}
      {isSelected && (
        <path 
          d={`M 0 0 L ${room.width} ${room.height}`} 
          stroke={colors.border} 
          strokeOpacity={0.2} 
          strokeWidth={1} 
        />
      )}

      {/* Text Label */}
      <text
        x={room.width / 2}
        y={room.height / 2 - 12}
        textAnchor="middle"
        className="pointer-events-none select-none text-xs font-bold"
        fill={colors.text}
        style={{ fontSize: Math.max(12, room.width / 15) }} 
      >
        {room.label.toUpperCase()}
      </text>
      
      {/* Dimensions & Area Text */}
      <text
        x={room.width / 2}
        y={room.height / 2 + 12}
        textAnchor="middle"
        className="pointer-events-none select-none"
        fill={colors.text}
        opacity={0.9}
        style={{ fontSize: '10px' }}
      >
        {widthFt}' x {heightFt}'
      </text>
      <text
        x={room.width / 2}
        y={room.height / 2 + 24}
        textAnchor="middle"
        className="pointer-events-none select-none text-[9px]"
        fill={colors.text}
        opacity={0.7}
      >
        {formatArea(room.width, room.height)}
      </text>

      {/* Warning Indicators */}
      {hasError && (
        <g transform={`translate(${room.width - 24}, 4)`}>
          <circle cx="10" cy="10" r="8" fill="#ef4444" />
          <text x="10" y="14" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">!</text>
        </g>
      )}

      {/* Resize Handles (Only when selected) */}
      {isSelected && (
        <>
          {/* Bottom Right Resize */}
          <rect
            x={room.width - 8}
            y={room.height - 8}
            width={16}
            height={16}
            {...handleStyle}
            style={{ cursor: 'nwse-resize' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e, room.id, 'se');
            }}
          />
           {/* Bottom Left Resize */}
           <rect
            x={-8}
            y={room.height - 8}
            width={16}
            height={16}
            {...handleStyle}
            style={{ cursor: 'nesw-resize' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e, room.id, 'sw');
            }}
          />
           {/* Top Right Resize */}
           <rect
            x={room.width - 8}
            y={-8}
            width={16}
            height={16}
            {...handleStyle}
            style={{ cursor: 'nesw-resize' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e, room.id, 'ne');
            }}
          />
           {/* Top Left Resize */}
           <rect
            x={-8}
            y={-8}
            width={16}
            height={16}
            {...handleStyle}
            style={{ cursor: 'nwse-resize' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e, room.id, 'nw');
            }}
          />
        </>
      )}
    </g>
  );
};

export default RoomShape;