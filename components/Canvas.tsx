import React, { useState } from 'react';
import { Room, FloorPlan } from '../types';
import RoomShape from './RoomShape';
import { getLocalCoordinates, snapToGrid } from '../utils/geometry';
import { GRID_SIZE } from '../constants';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

interface CanvasProps {
  floorPlan: FloorPlan;
  setFloorPlan: React.Dispatch<React.SetStateAction<FloorPlan>>;
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
  selectedPlumbingId: string | null;
  onSelectPlumbing: (id: string | null) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onDragStart?: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  floorPlan, 
  setFloorPlan, 
  selectedRoomId, 
  onSelectRoom,
  selectedPlumbingId,
  onSelectPlumbing,
  svgRef,
  onDragStart
}) => {
  // Viewport State
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Interaction State
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize' | null;
    roomId: string | null;
    startMouse: { x: number; y: number };
    startRoom: { x: number; y: number; w: number; h: number };
    handle?: string;
  }>({
    type: null,
    roomId: null,
    startMouse: { x: 0, y: 0 },
    startRoom: { x: 0, y: 0, w: 0, h: 0 }
  });

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = 1.05;
      const newScale = e.deltaY > 0 ? viewTransform.k / zoomFactor : viewTransform.k * zoomFactor;
      
      // Clamp zoom
      if (newScale < 0.2 || newScale > 5) return;

      setViewTransform(prev => ({
        ...prev,
        k: newScale
      }));
    } else {
        // Pan
        setViewTransform(prev => ({
            ...prev,
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY
        }));
    }
  };

  const startDrag = (e: React.MouseEvent, roomId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelectRoom(roomId);
    onSelectPlumbing(null); // Deselect plumbing when room is selected
    
    const room = floorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;

    // Notify parent that a drag operation is starting (for Undo/Redo history)
    if (onDragStart) {
        onDragStart();
    }

    const coords = getLocalCoordinates(e, svgRef.current, viewTransform);

    setDragState({
      type: handle ? 'resize' : 'move',
      roomId,
      handle,
      startMouse: coords,
      startRoom: { x: room.x, y: room.y, w: room.width, h: room.height }
    });
  };

  const startPan = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
        setIsPanning(true);
        onSelectRoom(null); // Deselect everything when clicking empty space
        onSelectPlumbing(null);
    }
  };

  const handlePlumbingClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectPlumbing(id);
    onSelectRoom(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning Logic
    if (isPanning) {
        setViewTransform(prev => ({
            ...prev,
            x: prev.x + e.movementX,
            y: prev.y + e.movementY
        }));
        return;
    }

    if (!dragState.type || !dragState.roomId) return;

    const currentCoords = getLocalCoordinates(e, svgRef.current, viewTransform);
    const deltaX = currentCoords.x - dragState.startMouse.x;
    const deltaY = currentCoords.y - dragState.startMouse.y;

    setFloorPlan(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id !== dragState.roomId) return room;

        if (dragState.type === 'move') {
          // Calculate new position
          let newX = dragState.startRoom.x + deltaX;
          let newY = dragState.startRoom.y + deltaY;
          
          // Snap to Grid
          newX = snapToGrid(newX);
          newY = snapToGrid(newY);

          return { ...room, x: newX, y: newY };
        } 
        
        if (dragState.type === 'resize' && dragState.handle) {
            let newX = room.x;
            let newY = room.y;
            let newW = room.width;
            let newH = room.height;

            const snappedDeltaX = snapToGrid(deltaX);
            const snappedDeltaY = snapToGrid(deltaY);

            if (dragState.handle.includes('e')) newW = Math.max(20, dragState.startRoom.w + snappedDeltaX);
            if (dragState.handle.includes('s')) newH = Math.max(20, dragState.startRoom.h + snappedDeltaY);
            if (dragState.handle.includes('w')) {
                const proposedW = dragState.startRoom.w - snappedDeltaX;
                if (proposedW > 20) {
                    newW = proposedW;
                    newX = dragState.startRoom.x + snappedDeltaX;
                }
            }
            if (dragState.handle.includes('n')) {
                const proposedH = dragState.startRoom.h - snappedDeltaY;
                if (proposedH > 20) {
                    newH = proposedH;
                    newY = dragState.startRoom.y + snappedDeltaY;
                }
            }

            return { ...room, x: newX, y: newY, width: newW, height: newH };
        }

        return room;
      })
    }));
  };

  const handleMouseUp = () => {
    setDragState({ type: null, roomId: null, startMouse: { x: 0, y: 0 }, startRoom: { x: 0, y: 0, w: 0, h: 0 } });
    setIsPanning(false);
  };

  return (
    <div className="flex-1 relative bg-slate-50 overflow-hidden cursor-crosshair h-full">
      
      {/* View Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 bg-white p-2 rounded shadow-md z-10">
        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setViewTransform(p => ({ ...p, k: p.k * 1.2 }))}>
            <ZoomIn size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setViewTransform(p => ({ ...p, k: Math.max(0.1, p.k / 1.2) }))}>
            <ZoomOut size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setViewTransform({ x: 0, y: 0, k: 1 })}>
            <Move size={20} className="text-gray-600" />
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full touch-none"
        onMouseDown={startPan}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.k})`}>
          
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="gray" strokeWidth="0.5" strokeOpacity="0.2"/>
            </pattern>
            <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
               <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="gray" strokeWidth="0.5" strokeOpacity="0.1"/>
            </pattern>
          </defs>
          <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#smallGrid)" />
          <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

          {/* Plumbing Points */}
          {floorPlan.plumbingPoints.map(p => {
             const isSelected = selectedPlumbingId === p.id;
             return (
              <g 
                key={p.id} 
                transform={`translate(${p.x}, ${p.y})`}
                onClick={(e) => handlePlumbingClick(e, p.id)}
                style={{ cursor: 'pointer' }}
              >
                  {/* Selection Highlight */}
                  {isSelected && <circle r="12" fill="none" stroke="#ef4444" strokeWidth="2" />}
                  
                  <circle r="8" fill={isSelected ? "#ef4444" : "#3b82f6"} fillOpacity="0.5" />
                  <circle r="3" fill="#1d4ed8" />
                  <text y="-12" textAnchor="middle" fontSize="8" fill="#1d4ed8" fontWeight="bold">H2O</text>
              </g>
             );
          })}

          {/* Rooms */}
          {floorPlan.rooms.map(room => (
            <RoomShape
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              onMouseDown={startDrag}
              allRooms={floorPlan.rooms}
              plumbingPoints={floorPlan.plumbingPoints}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default Canvas;