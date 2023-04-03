const FastPriorityQueue = require('fastpriorityqueue');
import { graph, node, edge, costDict, pathDict } from "./types"




export function astar(graph: graph, start: string, goal: string, time_zero: Date, criteria: string, costEstimationFunction: (a: node, b: node) => number): [number, edge[]] {
  let costs: { [key: string]: number } | null = null;
  let edgeToNode: { [key: string]: edge } | null = null;

  if (criteria === "t") {
    [costs, edgeToNode] = astarTime(graph, start, goal, costEstimationFunction);
  } else if (criteria === "p") {
    [costs, edgeToNode] = astarLines(graph, start, goal, costEstimationFunction);
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



export function astarTime(graph: graph, start: string, goal: string, costEstimationFunction: (a: node, b: node) => number): [costDict, pathDict] {
  const fFuncCosts: costDict = {};
  const gFuncCosts: costDict = {};
  const edgesUsed: pathDict = {};

  const openPQ = new FastPriorityQueue((a: [number, number, string], b: [number, number, string]) => a[0] < b[0]);

  for (const nodes of Object.values(graph.lines)) {
    for (const node of Object.keys(nodes)) {
      fFuncCosts[node] = Infinity;
      gFuncCosts[node] = Infinity;
      edgesUsed[node] = null;
    }
  }
  fFuncCosts[start] = 0;
  gFuncCosts[start] = 0;
  openPQ.add([0, 0, start]);


  while (!openPQ.isEmpty()) {

    const [_, currTime, currNode] = openPQ.poll()
    if (currNode == goal) return [gFuncCosts, edgesUsed]
    if (currTime > gFuncCosts[currNode]) continue

    const candidateNodes: { [key: string]: [number, number] } = {}

    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currNode])) {
          for (const edge of edges) {

            if (edge.timeFromMomentZero < currTime) continue

            const waiting_time = edge.timeFromMomentZero - currTime;
            const newCost = currTime + waiting_time + edge.rideCost;

            if (newCost < gFuncCosts[edge.stop]) {
              gFuncCosts[edge.stop] = newCost;
              const estFuncPower = 10;
              fFuncCosts[edge.stop] = newCost + estFuncPower * costEstimationFunction(graph.nodes[edge.stop], graph.nodes[goal]);
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


export function astarLines(graph: graph, start: string, goal: string, costEstimationFunction: (a: node, b: node) => number): [costDict, pathDict] {
  const fFuncCosts: costDict = {};
  const gFunctCosts: costDict = {};
  const edgesUsed: pathDict = {};

  for (const nodes of Object.values(graph.lines)) {
    for (const node of Object.keys(nodes)) {
      fFuncCosts[node] = Infinity;
      gFunctCosts[node] = Infinity;
      edgesUsed[node] = null;
    }
  }

  fFuncCosts[start] = 0;
  gFunctCosts[start] = 0;

  // priority, curr_line, node
  const openPQ = new FastPriorityQueue((first: [number, number, string], second: [number, number, string]) => first[0] < second[0]);
  openPQ.add([0, '', start]);

  while (!openPQ.isEmpty()) {
    const [curr_cost_lines, currentLine, currentNode] = openPQ.poll();

    if (currentNode == goal) {
      return [fFuncCosts, edgesUsed];
    }

    const candidateNodes: { [key: string]: [number, number] } = {};

    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currentNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
          for (const edge of edges) {

            if (edgesUsed[currentNode]?.arrivalTime == undefined || edge.departureTime >= edgesUsed[currentNode]?.arrivalTime) {

              let gCurrentNodeCost = gFunctCosts[currentNode];
              if (currentLine != edge.line) gCurrentNodeCost += 8;

              if (gCurrentNodeCost < gFunctCosts[edge.stop]) {
                gFunctCosts[edge.stop] = gCurrentNodeCost;

                fFuncCosts[edge.stop] = gCurrentNodeCost + costEstimationFunction(graph.nodes[edge.stop], graph.nodes[goal]);
                edgesUsed[edge.stop] = edge;
                openPQ.add([fFuncCosts[edge.stop], edge.line, edge.stop]);
                candidateNodes[edge.stop] = [fFuncCosts[edge.stop], gCurrentNodeCost];
              }
            }
          }
        }
      }
    }

    for (const [candidateNode, candidateCost] of Object.entries(candidateNodes)) {
      openPQ.add([...candidateCost, candidateNode]);
    }
  }

  return null;
}