import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Truck, Navigation, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MapView = ({ trucks = [], pickupRequests = [], userLocation = null, showControls = true }) => {
  const canvasRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 }); // Nairobi center
  const [zoom, setZoom] = useState(1);

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat, lng, canvasWidth, canvasHeight) => {
    // Simple projection for demo (not geographically accurate)
    const centerLat = mapCenter.lat;
    const centerLng = mapCenter.lng;
    
    const x = (canvasWidth / 2) + ((lng - centerLng) * 10000 * zoom);
    const y = (canvasHeight / 2) - ((lat - centerLat) * 10000 * zoom);
    
    return { x, y };
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw map background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw center marker
    const center = latLngToCanvas(mapCenter.lat, mapCenter.lng, width, height);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Nairobi CBD', center.x + 12, center.y + 4);

    // Draw pickup requests
    pickupRequests.forEach((request, index) => {
      if (request.pickupLocation) {
        const pos = latLngToCanvas(request.pickupLocation.lat, request.pickupLocation.lng, width, height);
        
        // Draw pickup point
        ctx.fillStyle = getStatusColor(request.status);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw pickup icon
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('P', pos.x, pos.y + 5);
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(request.userName, pos.x + 15, pos.y - 10);
        ctx.fillText(request.status, pos.x + 15, pos.y + 5);
      }
    });

    // Draw trucks
    trucks.forEach((truck, index) => {
      if (truck.location) {
        const pos = latLngToCanvas(truck.location.lat, truck.location.lng, width, height);
        
        // Draw truck
        ctx.fillStyle = getTruckColor(truck.status);
        ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
        
        // Draw truck icon
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('T', pos.x, pos.y + 3);
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(truck.driver, pos.x + 12, pos.y - 10);
        ctx.fillText(truck.licensePlate, pos.x + 12, pos.y + 5);
        ctx.fillText(truck.status, pos.x + 12, pos.y + 18);
      }
    });

    // Draw user location if provided
    if (userLocation) {
      const pos = latLngToCanvas(userLocation.lat, userLocation.lng, width, height);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('U', pos.x, pos.y + 4);
      
      ctx.fillStyle = 'white';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('You', pos.x + 12, pos.y);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      dispatched: '#3b82f6',
      'en-route': '#eab308',
      'at-location': '#8b5cf6',
      completed: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getTruckColor = (status) => {
    const colors = {
      available: '#10b981',
      dispatched: '#3b82f6',
      'en-route': '#eab308',
      'at-location': '#8b5cf6',
      completed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  useEffect(() => {
    drawMap();
  }, [trucks, pickupRequests, userLocation, mapCenter, zoom]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple click handling - could be enhanced for selecting items
    console.log('Map clicked at:', x, y);
  };

  return (
    <Card className="glass-effect border-red-900/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Live Map View
          </CardTitle>
          {showControls && (
            <div className="flex gap-2">
              <Button
                onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                variant="outline"
                size="sm"
                className="border-red-900/50 text-red-300 hover:bg-red-900/20"
              >
                Zoom In
              </Button>
              <Button
                onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                variant="outline"
                size="sm"
                className="border-red-900/50 text-red-300 hover:bg-red-900/20"
              >
                Zoom Out
              </Button>
              <Button
                onClick={() => {
                  setMapCenter({ lat: -1.2921, lng: 36.8219 });
                  setZoom(1);
                }}
                variant="outline"
                size="sm"
                className="border-red-900/50 text-red-300 hover:bg-red-900/20"
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full border border-red-900/30 rounded-lg cursor-crosshair"
            onClick={handleCanvasClick}
            style={{ maxHeight: '400px' }}
          />
          
          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Available Truck</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Dispatched Truck</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">En Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">At Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">Pending Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">Service Center</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{trucks.filter(t => t.status === 'available').length}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{trucks.filter(t => t.status === 'dispatched').length}</div>
              <div className="text-sm text-gray-400">Dispatched</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{pickupRequests.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{pickupRequests.filter(r => r.status === 'dispatched' || r.status === 'en-route').length}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView;