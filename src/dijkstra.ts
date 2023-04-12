
import FastPriorityQueue from 'fastpriorityqueue';
import { graph, edge, costDict, pathDict } from "./types"

export function dijkstra(graph: graph, sourceNode: string, destinationNode: string, momentZero: Date): [number, edge[]] {
  const [costs, edgesUsed] = dijkstraTime(graph, sourceNode, destinationNode) || [null, null];
  const path: edge[] = [];
  if (edgesUsed == null) throw new Error("Nie znaleziono połączenia!")
  let currentNode: string = destinationNode;
  while (currentNode !== sourceNode) {
    path.push(edgesUsed[currentNode]!);
    currentNode = edgesUsed[currentNode]!.start;
  }
  path.reverse();
  return [costs[destinationNode], path];
}
export function dijkstraTime(graph: graph, sourceNode: string, destinationNode: string): [costDict, pathDict] {
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
    if (!visitedNodes.has(currentNode)) visitedNodes.add(currentNode);
    if (currentNode === destinationNode) break;

    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currentNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
          const bestEdge = edges.reduce((a, b) => {

            const changeTimeA: number = (edgesUsed[a.start] && a.line !== edgesUsed[a.start].line) ? 1 : 0
            const resA = a.timeFromMomentZero >= costs[a.start] + changeTimeA ? a.timeFromMomentZero + a.rideCost : a.timeFromMomentZero + a.rideCost + 1440

            const changeTimeB: number = (edgesUsed[b.start] && b.line !== edgesUsed[b.start].line) ? 1 : 0
            const resB = b.timeFromMomentZero >= costs[b.start] + changeTimeB ? b.timeFromMomentZero + b.rideCost : b.timeFromMomentZero + b.rideCost + 1440

            return resA < resB ? a : b;
          });

          const newCost = bestEdge.timeFromMomentZero + bestEdge.rideCost

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

