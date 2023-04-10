import FastPriorityQueue from 'fastpriorityqueue';
import { graph, node, edge, costDict, pathDict } from "./types"

export function astar(graph: graph, start: string, goal: string, criteria: string, heuristics: (a: node, b: node) => number): [number, edge[]] {
  let costs: { [key: string]: number } | null = null;
  let edgeToNode: { [key: string]: edge } | null = null;

  if (criteria === "t") {
    [costs, edgeToNode] = astarTimeCriteria(graph, start, goal, heuristics);
  } else if (criteria === "p") {
    [costs, edgeToNode] = astarChangesCriteria(graph, start, goal, heuristics);
  }

  const path: edge[] = [];
  let currNode: string = goal;
  while (currNode !== start) {
    path.push(edgeToNode[currNode]);
    currNode = edgeToNode[currNode].start;
  }
  path.reverse();
  return [costs[goal], path];
}


export function astarTimeCriteria(graph: graph, start: string, goal: string, heuristicsFunction: (a: node, b: node) => number): [costDict, pathDict] {
  const fFuncCosts: costDict = {};
  const gFuncCosts: costDict = {};
  const edgesUsed: pathDict = {};
  const heuristicPower = 10000;

  for (const nodes of Object.values(graph.lines)) {
    for (const node of Object.keys(nodes)) {
      fFuncCosts[node] = Infinity;
      gFuncCosts[node] = Infinity;
      edgesUsed[node] = null;
    }
  }

  fFuncCosts[start] = 0;
  gFuncCosts[start] = 0;

  const openPQ = new FastPriorityQueue((a: [number, number, string], b: [number, number, string]) => a[0] < b[0]);
  openPQ.add([0, 0, start]);

  while (!openPQ.isEmpty()) {
    const [_, currTime, currNode] = openPQ.poll();

    if (currNode === goal) return [gFuncCosts, edgesUsed];

    if (currTime > gFuncCosts[currNode]) continue;

    const candidateNodes: { [key: string]: [number, number] } = {};

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
              fFuncCosts[edge.stop] = newCost + heuristicPower * heuristicsFunction(graph.nodes[edge.stop], graph.nodes[goal]);
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


export function astarChangesCriteria(graph: graph, start: string, goal: string, heuristicsFunction: (a: node, b: node) => number): [costDict, pathDict] {
  const fFuncCosts: costDict = {};
  const gFuncCosts: costDict = {};
  const edgesUsed: pathDict = {};
  const heuristicPower = 10;

  for (const nodes of Object.values(graph.lines)) {
    for (const node of Object.keys(nodes)) {
      fFuncCosts[node] = Infinity;
      gFuncCosts[node] = Infinity;
      edgesUsed[node] = null;
    }
  }

  fFuncCosts[start] = 0;
  gFuncCosts[start] = 0;

  const openPQ = new FastPriorityQueue((a: [number, string, string], b: [number, string, string]) => a[0] < b[0]);
  openPQ.add([0, '', start]);

  while (!openPQ.isEmpty()) {
    const [_, currentLine, currentNode] = openPQ.poll();

    if (currentNode === goal) return [gFuncCosts, edgesUsed];

    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currentNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
          for (const edge of edges) {
            if (!edgesUsed[currentNode] || edge.departureTime >= edgesUsed[currentNode].arrivalTime) {
              const lineChangePenalty = edgesUsed[currentNode] && edgesUsed[currentNode].line !== edge.line ? 1 : 0;
              const newCost = gFuncCosts[currentNode] + lineChangePenalty;

              if (newCost < gFuncCosts[edge.stop]) {
                gFuncCosts[edge.stop] = newCost;
                fFuncCosts[edge.stop] = newCost + heuristicPower * heuristicsFunction(graph.nodes[edge.stop], graph.nodes[goal]);
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
