"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chebyshev_distance = exports.cosine_distance = exports.unidimensional_distance = exports.euclidean_distance = exports.manhattan_distance = void 0;
function manhattan_distance(a, b) {
    return Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);
}
exports.manhattan_distance = manhattan_distance;
function euclidean_distance(a, b) {
    return Math.sqrt(Math.pow((a.latitude - b.latitude), 2) + Math.pow((a.longitude - b.longitude), 2));
}
exports.euclidean_distance = euclidean_distance;
function unidimensional_distance(a, b) {
    return Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude));
}
exports.unidimensional_distance = unidimensional_distance;
function cosine_distance(a, b) {
    const dot_product = a.longitude * b.longitude + a.latitude * b.latitude;
    const magnitude_a = Math.sqrt(Math.pow(a.longitude, 2) + Math.pow(a.latitude, 2));
    const magnitude_b = Math.sqrt(Math.pow(b.longitude, 2) + Math.pow(b.latitude, 2));
    return 1 - dot_product / (magnitude_a * magnitude_b);
}
exports.cosine_distance = cosine_distance;
function chebyshev_distance(a, b) {
    return Math.max(Math.abs(a.longitude - b.longitude), Math.abs(a.latitude - b.latitude));
}
exports.chebyshev_distance = chebyshev_distance;
//# sourceMappingURL=distances.js.map