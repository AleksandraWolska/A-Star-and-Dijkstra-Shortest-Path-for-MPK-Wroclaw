"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dijkstraTime = exports.dijkstra = void 0;
const fastpriorityqueue_1 = __importDefault(require("fastpriorityqueue"));
function dijkstra(graph, sourceNode, destinationNode, momentZero) {
    const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, momentZero);
    const path = [];
    let currentNode = destinationNode;
    while (currentNode !== sourceNode) {
        // console.log('Przystanek: ', currNode.toUpperCase());
        // console.log('Pokonano: ', edgeToNode[currNode]);
        path.push(edgesUsed[currentNode]);
        currentNode = edgesUsed[currentNode].start;
    }
    path.reverse();
    return [costs[destinationNode], path];
}
exports.dijkstra = dijkstra;
function dijkstraTime(graph, sourceNode, momentZero) {
    var _a;
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
        if (visitedNodes.has(currentNode))
            continue;
        visitedNodes.add(currentNode);
        if (currentCost > costs[currentNode])
            continue;
        const bestNewNodes = {};
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currentNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
                    for (const edge of edges) {
                        //const timeSinceZero: number = edge.timeSinceTimeZero(momentZero);
                        if (edge._timeSinceTimeZero < currentCost)
                            continue;
                        const waitingTime = edge._timeSinceTimeZero - currentCost;
                        const changeTime = (edgesUsed[edge.start] && edge.line != ((_a = edgesUsed[edge.start]) === null || _a === void 0 ? void 0 : _a.line)) ? 1 : 0;
                        const newCost = currentCost + edge.cost + waitingTime + changeTime;
                        if (newCost < costs[edge.stop]) {
                            costs[edge.stop] = newCost;
                            edgesUsed[edge.stop] = edge;
                            bestNewNodes[edge.stop] = newCost;
                        }
                    }
                }
            }
        }
        for (const [node, cost] of Object.entries(bestNewNodes)) {
            pq.add([cost, node]);
        }
    }
    return [costs, edgesUsed];
}
exports.dijkstraTime = dijkstraTime;
//# sourceMappingURL=dijkstra.js.map