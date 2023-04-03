import FastPriorityQueue from 'fastpriorityqueue';
import { graph, edge } from "./types"

export function dijkstra(graph: graph, sourceNode: string, destinationNode: string, momentZero: Date): [number, edge[]] {
  const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, momentZero);
  const path: edge[] = [];
  let currentNode: string = destinationNode;
  while (currentNode !== sourceNode) {
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

  const pq = new FastPriorityQueue((a: [number, string, Date], b: [number, string, Date]) => a[0] < b[0]);
  pq.add([0, sourceNode, momentZero]);

  while (!pq.isEmpty()) {
    const [currentCost, currentNode, currentTime] = pq.poll()!;
    if (visitedNodes.has(currentNode)) continue;
    visitedNodes.add(currentNode);

    if (currentCost > costs[currentNode]) continue;
    const bestNewNodes: { [key: string]: [number, edge] } = {};

    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currentNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
          for (const edge of edges) {
            if (currentTime > edge.arrivalTime) continue;

            const waitingTime = Math.max(edge.timeFromMomentZero - currentCost, 0);
            const changeTime = (edgesUsed[edge.start] && edge.line != edgesUsed[edge.start]?.line) ? 1 : 0;
            const newTime = new Date(currentTime.getTime() + (edge.rideCost + waitingTime + changeTime) * 60 * 1000);

            if (newTime > edge.arrivalTime) continue;

            const newCost = currentCost + edge.rideCost + waitingTime + changeTime;
            if (newCost < costs[edge.stop]) {
              costs[edge.stop] = newCost;
              edgesUsed[edge.stop] = edge;
              bestNewNodes[edge.stop] = [newCost, edge];
            }
          }
        }
      }
    }
    for (const [node, [cost, edge]] of Object.entries(bestNewNodes)) {
      pq.add([cost, node, new Date(currentTime.getTime() + (edge.rideCost + Math.max(edge.timeFromMomentZero - cost, 0)) * 60 * 1000)]);
    }
  }
  return [costs, edgesUsed];
}