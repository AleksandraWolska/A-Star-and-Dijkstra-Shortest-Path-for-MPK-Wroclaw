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
                        const resA = a.timeFromMomentZero >= costs[a.start] + changeTimeA ? a.timeFromMomentZero + a.rideCost : a.timeFromMomentZero + a.rideCost + 1440;
                        const changeTimeB = (edgesUsed[b.start] && b.line !== edgesUsed[b.start].line) ? 1 : 0;
                        const resB = b.timeFromMomentZero >= costs[b.start] + changeTimeB ? b.timeFromMomentZero + b.rideCost : b.timeFromMomentZero + b.rideCost + 1440;
                        return resA < resB ? a : b;
                    });
                    const newCost = bestEdge.timeFromMomentZero + bestEdge.rideCost;
                    if (newCost < costs[bestEdge.stop] && !visitedNodes.has(bestEdge.stop)) {
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
//# sourceMappingURL=dijkstra.js.map