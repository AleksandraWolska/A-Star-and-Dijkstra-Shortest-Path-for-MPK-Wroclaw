import FastPriorityQueue from 'fastpriorityqueue';
import { graph, edge } from "./types"

export function dijkstra(graph: graph, sourceNode: string, destinationNode: string, momentZero: Date): [number, edge[]] {
    const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, momentZero);
    const path: edge[] = [];
    let currentNode: string = destinationNode;
    while (currentNode !== sourceNode) {
        // console.log('Przystanek: ', currNode.toUpperCase());
        // console.log('Pokonano: ', edgeToNode[currNode]);
        path.push(edgesUsed[currentNode]!);
        currentNode = edgesUsed[currentNode]!.start;
    }
    path.reverse();
    return [costs[destinationNode], path];
}

export function dijkstraTime(graph: graph, sourceNode: string, momentZero: Date): [{ [key: string]: number }, { [key: string]: edge }] {
    const costs: { [key: string]: number } = {};
    const edgesUsed: { [key: string]: edge } = {};
    const visitedNodes = new Set<string>();

    for (const nodes of Object.values(graph.lines)) {
        for (const node in nodes) {
            costs[node] = Infinity;
            edgesUsed[node] = null;
        }
    }

    const pq = new FastPriorityQueue((a: [number, string], b: [number, string]) => a[0] < b[0]);
    pq.add([0, sourceNode]);

    while (!pq.isEmpty()) {

        const [currentCost, currentNode] = pq.poll()!;
        if (visitedNodes.has(currentNode)) continue;
        visitedNodes.add(currentNode);

        if (currentCost > costs[currentNode]) continue;
        const bestNewNodes: { [key: string]: number } = {};

        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currentNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
                    for (const edge of edges) {
                        const timeSinceZero: number = edge.timeSinceTimeZero(momentZero);
                        if (timeSinceZero < currentCost) continue;
                            
                        const waitingTime = timeSinceZero - currentCost;
                        const changeTime = (edgesUsed[edge.start] && edge.line != edgesUsed[edge.start]?.line) ? 1 : 0

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

