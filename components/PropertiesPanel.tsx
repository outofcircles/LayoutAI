import React from 'react';
import { Room, RoomType, PlumbingPoint, Door } from '../types';
import { ROOM_COLORS } from '../constants';
import { X, Trash2, RotateCw, Droplets, DoorOpen, Plus } from 'lucide-react';

interface PropertiesPanelProps {
  room: Room | null;
  plumbingPoint: PlumbingPoint | null;
  onUpdate: (id: string, updates: Partial<Room>) => void;
  onDeleteRoom: (id: string) => void;
  onDeletePlumbing: (id: string) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  room, 
  plumbingPoint,
  onUpdate, 
  onDeleteRoom, 
  onDeletePlumbing,
  onClose 
}) => {
  
  if (plumbingPoint) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col shadow-xl z-20">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Droplets size={16} className="text-blue-500"/> Plumbing Point
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-6">
           <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 border border-blue-100">
             This is a fixed plumbing stack. Kitchens and Toilets must be placed within range of these points.
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <div className="bg-gray-50 p-2 rounded border">
                <div className="text-xs text-gray-500">X Position</div>
                <div className="font-mono">{plumbingPoint.x}</div>
             </div>
             <div className="bg-gray-50 p-2 rounded border">
                <div className="text-xs text-gray-500">Y Position</div>
                <div className="font-mono">{plumbingPoint.y}</div>
             </div>
           </div>

           <button
              onClick={() => onDeletePlumbing(plumbingPoint.id)}
              className="w-full py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <Trash2 size={16} /> Delete Point
            </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-gray-400">
        <p>Select a room or object to edit</p>
      </div>
    );
  }

  const handleChange = (field: keyof Room, value: any) => {
    onUpdate(room.id, { [field]: value });
  };

  const handleAddDoor = () => {
    const newDoor: Door = {
        id: `door-${Date.now()}`,
        wall: 'top',
        offset: 10,
        width: 30
    };
    onUpdate(room.id, { doors: [...(room.doors || []), newDoor] });
  };

  const handleUpdateDoor = (doorId: string, updates: Partial<Door>) => {
      const updatedDoors = room.doors?.map(d => d.id === doorId ? { ...d, ...updates } : d);
      onUpdate(room.id, { doors: updatedDoors });
  };

  const handleDeleteDoor = (doorId: string) => {
      const updatedDoors = room.doors?.filter(d => d.id !== doorId);
      onUpdate(room.id, { doors: updatedDoors });
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col shadow-xl z-20 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">Room Properties</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Label</label>
            <input
              type="text"
              value={room.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Type</label>
            <select
              value={room.type}
              onChange={(e) => handleChange('type', e.target.value as RoomType)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            >
              {Object.keys(ROOM_COLORS).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800">Dimensions (ft)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={(room.width / 10).toFixed(1)}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) * 10)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={(room.height / 10).toFixed(1)}
                onChange={(e) => handleChange('height', parseFloat(e.target.value) * 10)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">X Pos</label>
              <input
                type="number"
                value={(room.x / 10).toFixed(1)}
                onChange={(e) => handleChange('x', parseFloat(e.target.value) * 10)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y Pos</label>
              <input
                type="number"
                value={(room.y / 10).toFixed(1)}
                onChange={(e) => handleChange('y', parseFloat(e.target.value) * 10)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Doors Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <DoorOpen size={16} className="text-slate-500"/> Doors
                </h4>
                <button 
                    onClick={handleAddDoor}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    title="Add Door"
                >
                    <Plus size={16} />
                </button>
            </div>
            
            <div className="space-y-3">
                {room.doors?.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No doors added.</p>
                )}
                {room.doors?.map((door, index) => (
                    <div key={door.id} className="bg-gray-50 p-2 rounded border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">Door {index + 1}</span>
                            <button onClick={() => handleDeleteDoor(door.id)} className="text-red-400 hover:text-red-600">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase">Wall</label>
                                <select 
                                    value={door.wall}
                                    onChange={(e) => handleUpdateDoor(door.id, { wall: e.target.value as any })}
                                    className="w-full text-xs p-1 border rounded bg-white"
                                >
                                    <option value="top">Top</option>
                                    <option value="right">Right</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase">Offset (ft)</label>
                                <input 
                                    type="number"
                                    value={(door.offset / 10).toFixed(1)}
                                    onChange={(e) => handleUpdateDoor(door.id, { offset: parseFloat(e.target.value) * 10 })}
                                    className="w-full text-xs p-1 border rounded"
                                    step="0.5"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3 pb-8">
            <button
              onClick={() => handleChange('rotation', (room.rotation + 90) % 360)}
              className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCw size={16} /> Rotate 90°
            </button>
            <button
              onClick={() => onDeleteRoom(room.id)}
              className="w-full py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> Delete Room
            </button>
        </div>
      </div>
    </div>
  );
};