import { node } from "./types"


export function manhattan_distance(a: node, b: node): number {
    return Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);
  }
  
export  function euclidean_distance(a: node, b: node): number {
    return Math.sqrt((a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2);
  }

export function unidimensional_distance(a: node, b: node): number {
    return Math.max(Math.abs(a.latitude - b.latitude), Math.abs(a.longitude - b.longitude));
  }
  
export  function cosine_distance(a: node, b: node): number {
    const dot_product = a.longitude * b.longitude + a.latitude * b.latitude;
    const magnitude_a = Math.sqrt(a.longitude ** 2 + a.latitude ** 2);
    const magnitude_b = Math.sqrt(b.longitude ** 2 + b.latitude ** 2);
    return 1 - dot_product / (magnitude_a * magnitude_b);
  }
  
export  function chebyshev_distance(a: node, b: node): number {
    return Math.max(Math.abs(a.longitude - b.longitude), Math.abs(a.latitude - b.latitude));
  }