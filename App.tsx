import React, { useState, useRef } from 'react';
import { FloorPlan, RoomType } from './types';
import { DEMO_FLOOR_PLAN, ROOM_COLORS } from './constants';
import Canvas from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { jsPDF } from 'jspdf';
import { 
  FileUp, 
  Save, 
  Plus, 
  Layout, 
  AlertTriangle,
  Info,
  Image as ImageIcon,
  FileText,
  Upload
} from 'lucide-react';

const App: React.FC = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan>({
    id: 'empty',
    name: 'New Project',
    width: 800,
    height: 1200,
    rooms: [],
    plumbingPoints: []
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedPlumbingId, setSelectedPlumbingId] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRoom = floorPlan.rooms.find(r => r.id === selectedRoomId) || null;
  const selectedPlumbing = floorPlan.plumbingPoints.find(p => p.id === selectedPlumbingId) || null;

  // Actions
  const handleImportDemo = () => {
    // Simulating a PDF Parse
    setFloorPlan(JSON.parse(JSON.stringify(DEMO_FLOOR_PLAN)));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        // Basic validation check
        if (parsed && Array.isArray(parsed.rooms)) {
          setFloorPlan(parsed);
        } else {
          alert("Invalid layout file format. Missing rooms array.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Failed to load design file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleSaveDesign = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(floorPlan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `layout-${floorPlan.name.replace(/\s+/g, '-').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExport = (format: 'jpeg' | 'pdf') => {
    if (!svgRef.current) return;
    
    // 1. Clone the SVG node
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    
    // Remove potential styling interference (e.g. w-full h-full from Tailwind)
    svgClone.removeAttribute('style');
    svgClone.removeAttribute('class');
    if (svgClone.hasAttribute('className')) svgClone.removeAttribute('className');

    // 2. Reset View/Transform for full export
    // The content is inside a <g>. We need to find the first <g> which contains the view transform
    const contentGroup = svgClone.querySelector('g');
    if (contentGroup) {
      contentGroup.removeAttribute('transform'); // Reset zoom/pan
    }
    
    // 3. Calculate Bounding Box of content
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const hasContent = floorPlan.rooms.length > 0 || floorPlan.plumbingPoints.length > 0;

    if (!hasContent) {
        minX = 0; minY = 0; maxX = floorPlan.width; maxY = floorPlan.height;
    } else {
        floorPlan.rooms.forEach(r => {
            // Calculate center
            const cx = r.x + r.width / 2;
            const cy = r.y + r.height / 2;
            
            // Determine effective dimensions based on rotation
            // We assume 90 degree increments
            const isRotated90 = Math.abs(r.rotation % 180) === 90;
            const w = isRotated90 ? r.height : r.width;
            const h = isRotated90 ? r.width : r.height;

            const rMinX = cx - w / 2;
            const rMaxX = cx + w / 2;
            const rMinY = cy - h / 2;
            const rMaxY = cy + h / 2;

            if (rMinX < minX) minX = rMinX;
            if (rMaxX > maxX) maxX = rMaxX;
            if (rMinY < minY) minY = rMinY;
            if (rMaxY > maxY) maxY = rMaxY;
        });
        
        floorPlan.plumbingPoints.forEach(p => {
            const r = 20; // Approx buffer for plumbing points
            if (p.x - r < minX) minX = p.x - r;
            if (p.y - r < minY) minY = p.y - r;
            if (p.x + r > maxX) maxX = p.x + r;
            if (p.y + r > maxY) maxY = p.y + r;
        });
    }

    // Add padding (extra generous to cover door swings)
    const padding = 60;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // 4. Set dimensions to match actual content bounds
    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
    
    // 5. Serialize
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 6. Load into Image
    const img = new Image();
    img.onload = () => {
      // 7. Draw to Canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      
      const fileName = `layout-${floorPlan.name.replace(/\s+/g, '-').toLowerCase()}`;

      if (format === 'jpeg') {
         const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
         const link = document.createElement('a');
         link.href = dataUrl;
         link.download = `${fileName}.jpg`;
         link.click();
      } else if (format === 'pdf') {
         // Orientation based on aspect ratio
         const orientation = width > height ? 'l' : 'p';
         const pdf = new jsPDF({
           orientation: orientation,
           unit: 'px',
           format: [width, height] 
         });
         
         const imgData = canvas.toDataURL('image/jpeg', 0.9);
         pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
         pdf.save(`${fileName}.pdf`);
      }
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleUpdateRoom = (id: string, updates: any) => {
    setFloorPlan(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const handleDeleteRoom = (id: string) => {
    setFloorPlan(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== id)
    }));
    setSelectedRoomId(null);
  };

  const handleDeletePlumbing = (id: string) => {
    setFloorPlan(prev => ({
      ...prev,
      plumbingPoints: prev.plumbingPoints.filter(p => p.id !== id)
    }));
    setSelectedPlumbingId(null);
  };

  const handleAddRoom = (type: RoomType) => {
    const newRoom = {
      id: `room-${Date.now()}`,
      type,
      label: `New ${type}`,
      x: 100,
      y: 100,
      width: type === 'toilet' ? 60 : 120,
      height: type === 'toilet' ? 60 : 120,
      rotation: 0,
      doors: []
    };
    setFloorPlan(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
    setSelectedRoomId(newRoom.id);
    setSelectedPlumbingId(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json" 
        className="hidden" 
      />

      {/* Top Toolbar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded text-white">
            <Layout size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-700">LayoutAI <span className="text-slate-400 font-normal">| Apartment Editor</span></h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleImportDemo}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <FileUp size={16} /> Load Demo
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Upload size={16} /> Upload JSON
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          <button 
            onClick={() => handleExport('jpeg')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            title="Export as JPEG"
          >
            <ImageIcon size={16} /> JPG
          </button>
          
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
            title="Export as PDF"
          >
            <FileText size={16} /> PDF
          </button>

          <button 
            onClick={handleSaveDesign}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors ml-2"
          >
            <Save size={16} /> Save JSON
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Toolbox */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 z-10">
          <div className="text-xs font-bold text-gray-400 mb-2">ADD</div>
          {Object.keys(ROOM_COLORS).map((type) => (
            <button
              key={type}
              onClick={() => handleAddRoom(type as RoomType)}
              className="w-10 h-10 rounded-md flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-transparent hover:border-gray-300"
              style={{ backgroundColor: ROOM_COLORS[type as RoomType].bg }}
              title={`Add ${type}`}
            >
              <Plus size={20} style={{ color: ROOM_COLORS[type as RoomType].text }} />
            </button>
          ))}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative flex flex-col">
            
            {/* Constraint Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow-sm border border-gray-200 z-10 text-xs text-gray-600 space-y-1">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 block"></span> Plumbing Points
                 </div>
                 <div className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-500" /> Validation Errors
                 </div>
                 <div className="flex items-center gap-2">
                    <Info size={12} className="text-blue-400" /> 1 grid unit = 1 sqft approx
                 </div>
            </div>

            <Canvas 
                floorPlan={floorPlan} 
                setFloorPlan={setFloorPlan}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                selectedPlumbingId={selectedPlumbingId}
                onSelectPlumbing={setSelectedPlumbingId}
                svgRef={svgRef}
            />
        </div>

        {/* Right Sidebar: Properties */}
        <PropertiesPanel 
          room={selectedRoom} 
          plumbingPoint={selectedPlumbing}
          onUpdate={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onDeletePlumbing={handleDeletePlumbing}
          onClose={() => {
            setSelectedRoomId(null);
            setSelectedPlumbingId(null);
          }}
        />
        
      </div>
    </div>
  );
};

export default App;