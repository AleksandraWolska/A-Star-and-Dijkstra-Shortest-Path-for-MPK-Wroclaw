"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.octileTimeHeuristic = exports.chebyshevTimeHeuristic = exports.euclideanTimeHeuristic = exports.manhattanTimeHeuristic = exports.octileDistanceHeuristic = exports.chebyshevDistanceHeuristic = exports.euclideanDistanceHeuristic = exports.manhattanDistanceHeuristic = void 0;
const VEHICLE_SPEED = 20;
const DEGREE_TO_KM = 111.1;
function manhattanDistanceHeuristic(a, b) {
    return (Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude)) * DEGREE_TO_KM;
}
exports.manhattanDistanceHeuristic = manhattanDistanceHeuristic;
function euclideanDistanceHeuristic(a, b) {
    return Math.sqrt(Math.pow((a.latitude - b.latitude), 2) + Math.pow((a.longitude - b.longitude), 2)) * DEGREE_TO_KM;
}
exports.euclideanDistanceHeuristic = euclideanDistanceHeuristic;
function chebyshevDistanceHeuristic(a, b) {
    return Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude)) * DEGREE_TO_KM;
}
exports.chebyshevDistanceHeuristic = chebyshevDistanceHeuristic;
function octileDistanceHeuristic(a, b) {
    const dx = Math.abs(a.latitude - b.latitude);
    const dy = Math.abs(a.longitude - b.longitude);
    const min = Math.min(dx, dy);
    const max = Math.max(dx, dy);
    return ((max - min) + min * Math.sqrt(2)) * DEGREE_TO_KM;
}
exports.octileDistanceHeuristic = octileDistanceHeuristic;
function manhattanTimeHeuristic(a, b) {
    const manhattanDistance = Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);
    const speedKmPerMinute = VEHICLE_SPEED / 60;
    const distanceKm = manhattanDistance * DEGREE_TO_KM;
    const timeInMinutes = distanceKm / speedKmPerMinute;
    return timeInMinutes;
}
exports.manhattanTimeHeuristic = manhattanTimeHeuristic;
function euclideanTimeHeuristic(a, b) {
    const dx = a.latitude - b.latitude;
    const dy = a.longitude - b.longitude;
    const euclideanDistance = Math.sqrt(dx * dx + dy * dy);
    const speedKmPerMinute = VEHICLE_SPEED / 60;
    const distanceKm = euclideanDistance * DEGREE_TO_KM;
    const timeInMinutes = distanceKm / speedKmPerMinute;
    return timeInMinutes;
}
exports.euclideanTimeHeuristic = euclideanTimeHeuristic;
function chebyshevTimeHeuristic(a, b) {
    const chebyshevDistance = Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude));
    const speedKmPerMinute = VEHICLE_SPEED / 60;
    const distanceKm = chebyshevDistance * DEGREE_TO_KM;
    const timeInMinutes = distanceKm / speedKmPerMinute;
    return timeInMinutes;
}
exports.chebyshevTimeHeuristic = chebyshevTimeHeuristic;
function octileTimeHeuristic(a, b) {
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
exports.octileTimeHeuristic = octileTimeHeuristic;
//# sourceMappingURL=distances.js.map