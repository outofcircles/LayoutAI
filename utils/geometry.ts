import React from 'react';
import { Coordinates, Room, PlumbingPoint } from '../types';
import { GRID_SIZE, PLUMBING_TOLERANCE } from '../constants';

// Snap value to nearest grid point
export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// Check if two rectangles overlap
export const checkOverlap = (r1: Room, r2: Room): boolean => {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
};

// Calculate distance between center of room and plumbing point
export const getDistanceToPlumbing = (room: Room, point: PlumbingPoint): number => {
  const roomCenterX = room.x + room.width / 2;
  const roomCenterY = room.y + room.height / 2;
  return Math.sqrt(Math.pow(roomCenterX - point.x, 2) + Math.pow(roomCenterY - point.y, 2));
};

// Check if a room (toilet/kitchen) is within range of any plumbing point
export const isPlumbingValid = (room: Room, points: PlumbingPoint[]): boolean => {
  if (room.type !== 'toilet' && room.type !== 'kitchen') return true;
  if (points.length === 0) return true; // No constraints defined

  return points.some((p) => getDistanceToPlumbing(room, p) <= PLUMBING_TOLERANCE);
};

// Convert SVG mouse event to local coordinates accounting for pan/zoom
export const getLocalCoordinates = (
  e: React.MouseEvent | MouseEvent,
  svgElement: SVGSVGElement | null,
  viewTransform: { x: number; y: number; k: number }
): Coordinates => {
  if (!svgElement) return { x: 0, y: 0 };

  const rect = svgElement.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const clientY = e.clientY - rect.top;

  return {
    x: (clientX - viewTransform.x) / viewTransform.k,
    y: (clientY - viewTransform.y) / viewTransform.k,
  };
};

export const formatArea = (width: number, height: number): string => {
  // Assuming 10px = 1ft
  const wFeet = width / 10;
  const hFeet = height / 10;
  return `${(wFeet * hFeet).toFixed(1)} sqft`;
};