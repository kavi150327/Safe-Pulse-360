import React, { useEffect, useRef, useState } from 'react';
import { Camera, Eye, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';

export type DetectionMode =
  | 'NORMAL'
  | 'SCHOOL_BUS'
  | 'HEAVY_PLATOON'
  | 'EMERGENCY'
  | 'WRONG_WAY'
  | 'ACCIDENT'
  | 'IMPAIRED'
  | 'PEDESTRIAN_DISTRACTED';

interface CameraDetectorCanvasProps {
  mode?: DetectionMode;
  intersectionName?: string;
  cameraId?: string;
  onDetectionUpdate?: (counts: Record<string, number>) => void;
}

export const CameraDetectorCanvas: React.FC<CameraDetectorCanvasProps> = ({
  mode = 'NORMAL',
  intersectionName = 'I1 - Central Junction',
  cameraId = 'CAM-C01-HD',
  onDetectionUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark Asphalt Camera View Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw Road Markings
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 40;
      // Vertical Road
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      // Horizontal Road
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Yellow Center Lines
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);

      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.setLineDash([]); // Reset line dash

      // Zebra Crosswalk Lines
      ctx.fillStyle = '#e2e8f0';
      for (let i = -60; i <= 60; i += 15) {
        ctx.fillRect(w / 2 + i, h / 2 - 80, 8, 30);
        ctx.fillRect(w / 2 + i, h / 2 + 50, 8, 30);
      }

      // Generate Bounding Box Vehicles based on mode
      const t = (frame % 300) / 300;

      const objects: Array<{
        x: number;
        y: number;
        w: number;
        h: number;
        label: string;
        color: string;
        conf: number;
        isWrongWay?: boolean;
        isAccident?: boolean;
        isPhoneUser?: boolean;
        isSwerving?: boolean;
      }> = [];

      if (mode === 'NORMAL') {
        objects.push(
          { x: w * 0.3, y: h * (0.2 + t * 0.5), w: 38, h: 22, label: 'Car', color: '#38bdf8', conf: 96 },
          { x: w * 0.35, y: h * (0.4 + t * 0.4), w: 18, h: 14, label: 'Two-Wheeler', color: '#a855f7', conf: 93 },
          { x: w * 0.65, y: h * (0.7 - t * 0.5), w: 42, h: 26, label: 'Bus', color: '#3b82f6', conf: 95 },
          { x: w * (0.2 + t * 0.5), y: h * 0.6, w: 36, h: 20, label: 'Car', color: '#38bdf8', conf: 94 }
        );
      } else if (mode === 'SCHOOL_BUS') {
        objects.push(
          { x: w * 0.48, y: h * (0.15 + t * 0.5), w: 58, h: 32, label: 'SCHOOL BUS (High Prio)', color: '#f59e0b', conf: 99 },
          { x: w * 0.3, y: h * 0.3, w: 36, h: 20, label: 'Car', color: '#38bdf8', conf: 92 },
          { x: w * 0.7, y: h * 0.6, w: 18, h: 14, label: 'Two-Wheeler', color: '#a855f7', conf: 94 }
        );
      } else if (mode === 'HEAVY_PLATOON') {
        objects.push(
          { x: w * 0.45, y: h * (0.1 + t * 0.4), w: 70, h: 36, label: 'Heavy Truck (Platoon 1)', color: '#f97316', conf: 97 },
          { x: w * 0.45, y: h * (0.35 + t * 0.4), w: 68, h: 34, label: 'Heavy Truck (Platoon 2)', color: '#f97316', conf: 96 },
          { x: w * 0.45, y: h * (0.6 + t * 0.4), w: 65, h: 34, label: 'Heavy Truck (Platoon 3)', color: '#f97316', conf: 98 }
        );
      } else if (mode === 'EMERGENCY') {
        objects.push(
          { x: w * 0.48, y: h * (0.8 - t * 0.7), w: 54, h: 28, label: 'AMBULANCE (EMERGENCY)', color: '#ef4444', conf: 99 },
          { x: w * 0.25, y: h * 0.4, w: 36, h: 20, label: 'Car (Pulling over)', color: '#64748b', conf: 91 },
          { x: w * 0.75, y: h * 0.5, w: 38, h: 22, label: 'Car (Pulling over)', color: '#64748b', conf: 90 }
        );
      } else if (mode === 'WRONG_WAY') {
        objects.push(
          { x: w * 0.52, y: h * (0.8 - t * 0.6), w: 40, h: 24, label: 'WRONG WAY VEHICLE', color: '#dc2626', conf: 98, isWrongWay: true },
          { x: w * 0.45, y: h * (0.2 + t * 0.5), w: 36, h: 20, label: 'Car (Normal direction)', color: '#38bdf8', conf: 95 }
        );
      } else if (mode === 'ACCIDENT') {
        objects.push(
          { x: w * 0.48, y: h * 0.46, w: 42, h: 26, label: 'ACCIDENT COLLISION A', color: '#ef4444', conf: 99, isAccident: true },
          { x: w * 0.53, y: h * 0.48, w: 38, h: 24, label: 'ACCIDENT COLLISION B', color: '#ef4444', conf: 98, isAccident: true }
        );
      } else if (mode === 'IMPAIRED') {
        const swerveX = w * 0.48 + Math.sin(frame * 0.15) * 40;
        objects.push(
          { x: swerveX, y: h * (0.15 + t * 0.5), w: 38, h: 22, label: 'SUSPECTED IMPAIRED (Swerving)', color: '#eab308', conf: 94, isSwerving: true }
        );
      } else if (mode === 'PEDESTRIAN_DISTRACTED') {
        objects.push(
          { x: w * 0.45, y: h * 0.38, w: 20, h: 32, label: 'DISTRACTED PEDESTRIAN (Phone)', color: '#f43f5e', conf: 96, isPhoneUser: true },
          { x: w * 0.35, y: h * 0.7, w: 38, h: 22, label: 'Car Stopped @ RED', color: '#38bdf8', conf: 92 }
        );
      }

      // Draw Bounding Boxes and Labels
      objects.forEach((obj) => {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2.5;

        if (obj.isWrongWay || obj.isAccident || obj.isPhoneUser) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

        // Bounding Box Corners Accent
        ctx.fillStyle = obj.color;
        const s = 6;
        ctx.fillRect(obj.x - 2, obj.y - 2, s, 2);
        ctx.fillRect(obj.x - 2, obj.y - 2, 2, s);
        ctx.fillRect(obj.x + obj.w - s + 2, obj.y - 2, s, 2);
        ctx.fillRect(obj.x + obj.w, obj.y - 2, 2, s);

        // Label Tag
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y - 18, ctx.measureText(`${obj.label} ${obj.conf}%`).width + 12, 18);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${obj.label} ${obj.conf}%`, obj.x + 6, obj.y - 5);

        // Direction Vector Arrows for Wrong-Way
        if (obj.isWrongWay) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(obj.x + obj.w / 2, obj.y);
          ctx.lineTo(obj.x + obj.w / 2, obj.y - 25);
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(obj.x + obj.w / 2 - 5, obj.y - 18);
          ctx.lineTo(obj.x + obj.w / 2, obj.y - 25);
          ctx.lineTo(obj.x + obj.w / 2 + 5, obj.y - 18);
          ctx.fill();
        }
      });

      // Camera HUD Overlays
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(12, 12, 220, 50);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, 220, 50);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 28, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`LIVE REC - ${cameraId}`, 40, 31);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${intersectionName}`, 28, 48);

      // Top Right Detection Stats
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(w - 180, 12, 168, 50);
      ctx.strokeRect(w - 180, 12, 168, 50);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`YOLOv8 + OpenCV Engine`, w - 170, 28);
      ctx.fillStyle = '#4ade80';
      ctx.font = '10px monospace';
      ctx.fillText(`FPS: 30.0 | Objects: ${objects.length}`, w - 170, 48);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [mode, intersectionName, cameraId]);

  return (
    <div className="relative w-full h-[340px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <canvas ref={canvasRef} width={640} height={340} className="w-full h-full object-cover" />

      {/* Mode Status Badge Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-300 font-medium">Vision Mode:</span>
        <span className="font-bold text-cyan-300 uppercase">{mode.replace('_', ' ')}</span>
      </div>
    </div>
  );
};
