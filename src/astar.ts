import FastPriorityQueue from 'fastpriorityqueue';
import { graph, node, edge, costDict, pathDict } from "./types"

export function astar(graph: graph, start: string, goal: string, time_zero: Date, criteria: string, costEstimationFunction: (a: node, b: node) => number): [number, edge[]] {
  let costs: { [key: string]: number } | null = null;
  let edgeToNode: { [key: string]: edge } | null = null;

  if (criteria === "t") {
    [costs, edgeToNode] = astarTimeHeuristics(graph, start, goal, costEstimationFunction);
  } else if (criteria === "p") {
    [costs, edgeToNode] = astarChangesHeuristics(graph, start, goal, costEstimationFunction);
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


/**

Funkcja znajdująca najkrótszą ścieżkę między dwoma węzłami grafu z wykorzystaniem algorytmu A* i heurystyki czasowej.
@param {object} graph - graf, w którym znajdują się węzły i krawędzie
@param {string} start - węzeł początkowy
@param {string} goal - węzeł końcowy
@param {function} costEstimationFunction - funkcja heurystyczna określająca koszt przeszukania grafu
@returns {array} - tablica z dwoma słownikami: kosztami najkrótszej ścieżki i użytych krawędzi
*/
export function astarTimeHeuristics(graph: graph, start: string, goal: string, costEstimationFunction: (a: node, b: node) => number): [costDict, pathDict] {
  // Inicjalizacja słowników kosztów f i g oraz użytych krawędzi.
  const fFuncCosts: costDict = {};
  const gFuncCosts: costDict = {};
  const edgesUsed: pathDict = {};

  // Inicjalizacja kolejki priorytetowej zgodnie z kosztem funkcji f.
  const openPQ = new FastPriorityQueue((a: [number, number, string], b: [number, number, string]) => a[0] < b[0]);

  // Inicjalizacja kosztów, kosztów heurystycznych, użytych krawędzi w początkowym węźle.
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

  // Pętla główna algorytmu A*.
  while (!openPQ.isEmpty()) {

    // Zdejmowanie z kolejki węzła o najniższym koszcie funkcji f.
    const [_, currTime, currNode] = openPQ.poll();

    // Sprawdzenie, czy przeszukujemy już węzeł końcowy.
    if (currNode == goal) return [gFuncCosts, edgesUsed];

    // Sprawdzenie, czy węzeł ten nie został już przeszukany w innym węźle z niższym kosztem funkcji g.
    if (currTime > gFuncCosts[currNode]) continue

    // Inicjalizacja słownika kandydatów na następne węzły.
    const candidateNodes: { [key: string]: [number, number] } = {}

    // Przeglądanie krawędzi sąsiadujących z aktualnym węzłem.
    for (const [line, nodes] of Object.entries(graph.lines)) {
      // Sprawdzenie, czy węzeł bieżący należy do linii
      if (currNode in nodes) {
        // Pętla iterująca po sąsiadach węzła bieżącego
        for (const [neighbour, edges] of Object.entries(nodes[currNode])) {
          // Pętla iterująca po krawędziach węzła sąsiada
          for (const edge of edges) {
            // Sprawdzenie, czy czas przejazdu krawędzi jest mniejszy niż czas bieżący
            if (edge.timeFromMomentZero < currTime) continue

            // Obliczenie czasu oczekiwania i całkowitego kosztu przejazdu
            const waiting_time = edge.timeFromMomentZero - currTime;
            const newCost = currTime + waiting_time + edge.rideCost;

            // Aktualizacja kosztów, jeśli koszt przejazdu przez krawędź jest mniejszy
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

    // Dodanie węzłów kandydujących do kolejki priorytetowej
    for (const [node, prio_cost] of Object.entries(candidateNodes)) {
      openPQ.add([...prio_cost, node]);
    }
  }
  return null;
}


export function astarChangesHeuristics(graph: graph, start: string, goal: string, costEstimationFunction: (a: node, b: node) => number): [costDict, pathDict] {
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
  const openPQ = new FastPriorityQueue((first: [number, string | number, string], second: [number, string | number, string]) => first[0] < second[0]);
  openPQ.add([0, '', start]);

  while (!openPQ.isEmpty()) {
    const [curr_cost_lines, currentLine, currentNode] = openPQ.poll();
    if (currentNode == goal) return [fFuncCosts, edgesUsed]
    const candidateNodes: { [key: string]: [number, number] } = {};
    for (const [line, nodes] of Object.entries(graph.lines)) {
      if (currentNode in nodes) {
        for (const [neighbour, edges] of Object.entries(nodes[currentNode])) {
          for (const edge of edges) {

            if (edgesUsed[currentNode]?.arrivalTime == undefined || edge.departureTime >= edgesUsed[currentNode]?.arrivalTime) {

              let gCurrentNodeCost = gFunctCosts[currentNode]
              if (currentLine != edge.line) gCurrentNodeCost += 8

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