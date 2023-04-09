"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dijkstraTime = exports.dijkstra = void 0;
const fastpriorityqueue_1 = __importDefault(require("fastpriorityqueue"));
function dijkstra(graph, sourceNode, destinationNode, momentZero) {
    const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, destinationNode);
    const path = [];
    let currentNode = destinationNode;
    while (currentNode !== sourceNode) {
        path.push(edgesUsed[currentNode]);
        currentNode = edgesUsed[currentNode].start;
    }
    path.reverse();
    console.log(path);
    return [costs[destinationNode], path];
}
exports.dijkstra = dijkstra;
function dijkstraTime(graph, sourceNode, destinationNode) {
    const costs = {};
    const edgesUsed = {};
    const visitedNodes = new Set();
    for (const nodes of Object.values(graph.lines)) {
        for (const node in nodes) {
            costs[node] = Infinity;
            edgesUsed[node] = null;
        }
    }
    const pq = new fastpriorityqueue_1.default((a, b) => a[0] < b[0]);
    pq.add([0, sourceNode]);
    while (!pq.isEmpty()) {
        const [currentCost, currentNode] = pq.poll();
        if (!visitedNodes.has(currentNode))
            visitedNodes.add(currentNode);
        if (currentNode === destinationNode)
            break;
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currentNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
                    const bestEdge = edges.reduce((a, b) => {
                        const changeTimeA = (edgesUsed[a.start] && a.line !== edgesUsed[a.start].line) ? 1 : 0;
                        let diffA = a.timeFromMomentZero - (costs[a.start] + changeTimeA);
                        if (diffA < 0) {
                            diffA += 1440;
                        }
                        const resA = a.timeFromMomentZero >= costs[a.start] + changeTimeA ? a.timeFromMomentZero + a.rideCost : a.timeFromMomentZero + a.rideCost + 1440;
                        //if (a.timeFromMomentZero >= costs[a.start] + changeTimeA && a.timeFromMomentZero + a.rideCost < costs[a.stop]) return a
                        //if (diffA == 0) return a
                        const changeTimeB = (edgesUsed[b.start] && b.line !== edgesUsed[b.start].line) ? 1 : 0;
                        let diffB = b.timeFromMomentZero - (costs[b.start] + changeTimeB);
                        if (diffB < 0) {
                            diffB += 1440;
                        }
                        const resB = b.timeFromMomentZero >= costs[b.start] + changeTimeB ? b.timeFromMomentZero + b.rideCost : b.timeFromMomentZero + b.rideCost + 1440;
                        return resA < resB ? a : b;
                    });
                    console.log("best: " + bestEdge.line + " " + bestEdge.timeFromMomentZero);
                    //const changeTime = (edgesUsed[bestEdge.start] && bestEdge.line !== edgesUsed[bestEdge.start]?.line) ? 1 : 0;
                    const newCost = bestEdge.timeFromMomentZero + bestEdge.rideCost;
                    //console.log(newCost)
                    if (newCost < costs[bestEdge.stop] && !visitedNodes.has(bestEdge.stop)) {
                        if (bestEdge.stop == destinationNode)
                            console.log(newCost);
                        costs[bestEdge.stop] = newCost;
                        edgesUsed[bestEdge.stop] = bestEdge;
                        pq.add([newCost, bestEdge.stop]);
                    }
                }
            }
        }
    }
    return [costs, edgesUsed];
}
exports.dijkstraTime = dijkstraTime;
// import FastPriorityQueue from 'fastpriorityqueue';
// import { graph, edge, costDict, pathDict } from "./types"
// export function dijkstra(graph: graph, sourceNode: string, destinationNode: string, momentZero: Date): [number, edge[]] {
//   const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, momentZero);
//   const path: edge[] = [];
//   let currentNode: string = destinationNode;
//   while (currentNode !== sourceNode) {
//     path.push(edgesUsed[currentNode]!);
//     currentNode = edgesUsed[currentNode]!.start;
//   }
//   path.reverse();
//   return [costs[destinationNode], path];
// }
// export function dijkstraTime(graph: graph, sourceNode: string, momentZero: Date): [costDict, pathDict] {
//   const costs: { [key: string]: number } = {};
//   const edgesUsed: { [key: string]: edge } = {};
//   const visitedNodes = new Set<string>();
//   for (const nodes of Object.values(graph.lines)) {
//     for (const node in nodes) {
//       costs[node] = Infinity;
//       edgesUsed[node] = null;
//     }
//   }
//   const pq = new FastPriorityQueue((a: [number, string], b: [number, string]) => a[0] < b[0]);
//   pq.add([0, sourceNode]);
//   while (!pq.isEmpty()) {
//     const [currentCost, currentNode] = pq.poll()!;
//     if (!visitedNodes.has(currentNode)) {
//         visitedNodes.add(currentNode);
//     }
//     const bestNewNodes: { [key: string]: [number, edge] } = {};
//     for (const [line, nodes] of Object.entries(graph.lines)) {
//       if (currentNode in nodes) {
//         for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
//           for (const edge of edges) {
//             if (edge.timeFromMomentZero < currentCost) continue;
//             let  waitingTime = edge.timeFromMomentZero - currentCost
//             const changeTime = (edgesUsed[edge.start] && edge.line != edgesUsed[edge.start]?.line) ? 1 : 0;
//             const newCost = currentCost + edge.rideCost + waitingTime + changeTime;
//             if (newCost < costs[edge.stop]) {
//               costs[edge.stop] = newCost;
//               edgesUsed[edge.stop] = edge;
//               bestNewNodes[edge.stop] = [newCost, edge];
//             }
//           }
//         }
//       }
//     }
//     for (const [node, [cost, edge]] of Object.entries(bestNewNodes)) {
//       pq.add([cost, node]);
//     }
//   }
//   return [costs, edgesUsed];
// }
//# sourceMappingURL=dijkstra.js.map