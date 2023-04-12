import { node } from "./types"

const VEHICLE_SPEED = 20
const DEGREE_TO_KM = 111.1


export function manhattanDistanceHeuristic(a: node, b: node): number {
  return (Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude)) * DEGREE_TO_KM;
}

export function euclideanDistanceHeuristic(a: node, b: node): number {
  return Math.sqrt((a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2) * DEGREE_TO_KM;
}


export function chebyshevDistanceHeuristic(a: node, b: node): number {
  return Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude)) * DEGREE_TO_KM;
}


export function octileDistanceHeuristic(a: node, b: node): number {
  const dx = Math.abs(a.latitude - b.latitude);
  const dy = Math.abs(a.longitude - b.longitude);
  const min = Math.min(dx, dy);
  const max = Math.max(dx, dy);
  return ((max - min) + min * Math.sqrt(2)) * DEGREE_TO_KM;
}


export function manhattanTimeHeuristic(a: node, b: node): number {
  const manhattanDistance = Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);
  const speedKmPerMinute = VEHICLE_SPEED / 60;
  const distanceKm = manhattanDistance * DEGREE_TO_KM;
  const timeInMinutes = distanceKm / speedKmPerMinute;

  return timeInMinutes;
}


export function euclideanTimeHeuristic(a: node, b: node): number {
  const dx = a.latitude - b.latitude;
  const dy = a.longitude - b.longitude;
  const euclideanDistance = Math.sqrt(dx * dx + dy * dy);
  const speedKmPerMinute = VEHICLE_SPEED / 60;
  const distanceKm = euclideanDistance * DEGREE_TO_KM;
  const timeInMinutes = distanceKm / speedKmPerMinute;

  return timeInMinutes;
}

export function chebyshevTimeHeuristic(a: node, b: node): number {
  const chebyshevDistance = Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude));
  const speedKmPerMinute = VEHICLE_SPEED / 60;
  const distanceKm = chebyshevDistance * DEGREE_TO_KM;
  const timeInMinutes = distanceKm / speedKmPerMinute;

  return timeInMinutes;
}

export function octileTimeHeuristic(a: node, b: node): number {
  const dx = Math.abs(a.latitude - b.latitude);
  const dy = Math.abs(a.longitude - b.longitude);
  const min = Math.min(dx, dy);
  const max = Math.max(dx, dy);
  const octileDistance = (max - min) + min * Math.sqrt(2);

  const speedKmPerMinute = VEHICLE_SPEED / 60;
  const distanceKm = octileDistance * DEGREE_TO_KM;
  const timeInMinutes = distanceKm / speedKmPerMinute;

  return timeInMinutes;
}