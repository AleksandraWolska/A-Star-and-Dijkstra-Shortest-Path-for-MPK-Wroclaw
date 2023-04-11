"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.astarChangesCriteria = exports.astarTimeCriteria = exports.astar = void 0;
const fastpriorityqueue_1 = __importDefault(require("fastpriorityqueue"));
const parameters_1 = require("./parameters");
function astar(graph, start, goal, criteria, heuristics) {
    let costs = null;
    let edgeToNode = null;
    if (criteria === "t") {
        [costs, edgeToNode] = astarTimeCriteria(graph, start, goal, heuristics);
    }
    else if (criteria === "p") {
        [costs, edgeToNode] = astarChangesCriteria(graph, start, goal, heuristics);
    }
    const path = [];
    let currNode = goal;
    while (currNode !== start) {
        path.push(edgeToNode[currNode]);
        currNode = edgeToNode[currNode].start;
    }
    path.reverse();
    return [costs[goal], path];
}
exports.astar = astar;
function astarTimeCriteria(graph, start, goal, heuristicsFunction) {
    const fFuncCosts = {};
    const gFuncCosts = {};
    const edgesUsed = {};
    for (const nodes of Object.values(graph.lines)) {
        for (const node of Object.keys(nodes)) {
            fFuncCosts[node] = Infinity;
            gFuncCosts[node] = Infinity;
            edgesUsed[node] = null;
        }
    }
    fFuncCosts[start] = 0;
    gFuncCosts[start] = 0;
    const openPQ = new fastpriorityqueue_1.default((a, b) => a[0] < b[0]);
    openPQ.add([0, 0, start]);
    while (!openPQ.isEmpty()) {
        const [_, currTime, currNode] = openPQ.poll();
        if (currNode === goal)
            return [gFuncCosts, edgesUsed];
        if (currTime > gFuncCosts[currNode])
            continue;
        const candidateNodes = {};
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currNode])) {
                    for (const edge of edges) {
                        const lineChangePenalty = edgesUsed[currNode] && edgesUsed[currNode].line !== edge.line ? 1 : 0;
                        let newCost = edge.timeFromMomentZero + edge.rideCost;
                        if (edge.timeFromMomentZero < currTime + lineChangePenalty) {
                            newCost += 1440;
                        }
                        if (newCost < gFuncCosts[edge.stop]) {
                            gFuncCosts[edge.stop] = newCost;
                            fFuncCosts[edge.stop] = newCost + parameters_1.ASTAR_TIME_POWER * heuristicsFunction(graph.nodes[edge.stop], graph.nodes[goal]);
                            edgesUsed[edge.stop] = edge;
                            openPQ.add([fFuncCosts[edge.stop], newCost, edge.stop]);
                            candidateNodes[edge.stop] = [fFuncCosts[edge.stop], newCost];
                        }
                    }
                }
            }
        }
        for (const [node, prio_cost] of Object.entries(candidateNodes)) {
            openPQ.add([...prio_cost, node]);
        }
    }
    return null;
}
exports.astarTimeCriteria = astarTimeCriteria;
function astarChangesCriteria(graph, start, goal, heuristicsFunction) {
    const fFuncCosts = {};
    const gFuncCosts = {};
    const edgesUsed = {};
    for (const nodes of Object.values(graph.lines)) {
        for (const node of Object.keys(nodes)) {
            fFuncCosts[node] = Infinity;
            gFuncCosts[node] = Infinity;
            edgesUsed[node] = null;
        }
    }
    fFuncCosts[start] = 0;
    gFuncCosts[start] = 0;
    const openPQ = new fastpriorityqueue_1.default((a, b) => a[0] < b[0]);
    openPQ.add([0, '', start]);
    while (!openPQ.isEmpty()) {
        const [_, currentLine, currentNode] = openPQ.poll();
        if (currentNode === goal)
            return [gFuncCosts, edgesUsed];
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currentNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
                    for (const edge of edges) {
                        if (!edgesUsed[currentNode] || edge.departureTime >= edgesUsed[currentNode].arrivalTime) {
                            const lineChangePenalty = edgesUsed[currentNode] && edgesUsed[currentNode].line !== edge.line ? 1 : 0;
                            const newCost = gFuncCosts[currentNode] + lineChangePenalty;
                            if (newCost < gFuncCosts[edge.stop]) {
                                gFuncCosts[edge.stop] = newCost;
                                fFuncCosts[edge.stop] = newCost + parameters_1.ASTAR_CHANGES_POWER * heuristicsFunction(graph.nodes[edge.stop], graph.nodes[goal]);
                                edgesUsed[edge.stop] = edge;
                                openPQ.add([fFuncCosts[edge.stop], edge.line, edge.stop]);
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}
exports.astarChangesCriteria = astarChangesCriteria;
//# sourceMappingURL=astar.js.map