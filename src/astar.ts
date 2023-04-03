const FastPriorityQueue = require('fastpriorityqueue');
import { graph, node, edge } from "./types"

export function manhattan_distance(a: node, b: node): number {
    return Math.abs(a.lat - b.lat) + Math.abs(a.lon - b.lon);
  }
  
  function euclidean_distance(a: node, b: node): number {
    return Math.sqrt((a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2);
  }
  
//   function towncenter_distance(a: node, b: node): number {
//     return euclidean_distance(a, { id: '', lat: 0, lon: 0 }) + euclidean_distance({ id: '', lat: 0, lon: 0 }, b);
//   }
  
  function unidimensional_distance(a: node, b: node): number {
    return Math.max(Math.abs(a.lat - b.lat), Math.abs(a.lon - b.lon));
  }
  
  function cosine_distance(a: node, b: node): number {
    const dot_product = a.lon * b.lon + a.lat * b.lat;
    const magnitude_a = Math.sqrt(a.lon ** 2 + a.lat ** 2);
    const magnitude_b = Math.sqrt(b.lon ** 2 + b.lat ** 2);
    return 1 - dot_product / (magnitude_a * magnitude_b);
  }
  
  function chebyshev_distance(a: node, b: node): number {
    return Math.max(Math.abs(a.lon - b.lon), Math.abs(a.lat - b.lat));
  }
  

  export function astar(graph: graph, start: string, goal: string, time_zero: Date, criteria: string, heurestics: (a: node, b: node)=> number): [number, edge[]] {
    let costs: { [key: string]: number } | null = null;
    let edgeToNode:  { [key: string]: edge } | null = null;
    
    if (criteria === "t") {
    [costs, edgeToNode] = astarTime(graph, start, goal, time_zero, heurestics);
    } else if (criteria === "p") {
    [costs, edgeToNode] = astarLines(graph, start, goal, time_zero, heurestics);
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



export function astarTime(graph: graph, start: string, goal: string, time_zero: Date, heurestic_fn: (a: node, b: node)=> number):  [{ [key: string]: number }, { [key: string]: edge }] {
    const f_costs: { [key: string]: number } = {};
    const g_costs: { [key: string]: number } = {};
    const edgeToNode: { [key: string]: edge } = {};
    const pq = new FastPriorityQueue((a: [number, number, string], b: [number, number, string]) => a[0] < b[0]); // priority queue
    for (const nodes of Object.values(graph.lines)) {
        for (const node of Object.keys(nodes)) {
            f_costs[node] = Infinity;
            g_costs[node] = Infinity;
            edgeToNode[node] = null;
        }
    }
    
    f_costs[start] = 0;
    g_costs[start] = 0;
    pq.add([0, 0, start]);
    
    while (!pq.isEmpty()) {
        const [_, currTime, currNode] = pq.poll();
        if (currNode == goal) {
            return [g_costs, edgeToNode];
        }
        if (currTime > g_costs[currNode]) {
            continue;
        }
    
        const bestNewNodes: { [key: string]: [number, number] } = {};
    
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (currNode in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[currNode])) {
                    for (const edge of edges) {
                        const timeSinceZero = edge.timeSinceTimeZero(time_zero);
                        if (timeSinceZero < currTime) {
                            continue;
                        }
                        const waiting_time = timeSinceZero - currTime;
                        const newCost = currTime + waiting_time + edge.cost;
                        if (newCost < g_costs[edge.stop]) {
                            g_costs[edge.stop] = newCost;
                            const magic_number = 10;
                            f_costs[edge.stop] = newCost + magic_number * heurestic_fn(graph.nodes[edge.stop], graph.nodes[goal]);
                            edgeToNode[edge.stop] = edge;
                            pq.add([f_costs[edge.stop], newCost, edge.stop]);
                            bestNewNodes[edge.stop] = [f_costs[edge.stop], newCost];
                        }
                    }
                }
            }
        }
    
        for (const [node, prio_cost] of Object.entries(bestNewNodes)) {
            pq.add([...prio_cost, node]);
        }
    }
    return null;
}


export function astarLines(
    graph: graph,
    start: string,
    goal: string,
    momentZero: Date,
    costEstimationFunction: (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => number
  ): [{ [key: string]: number }, { [key: string]: edge }] {
    const f_costs: { [key: string]: number } = {};
    const g_costs: { [key: string]: number } = {};
    const edge_to_node: { [key: string]: edge } = {};
  
    for (const nodes of Object.values(graph.lines)) {
      for (const node of Object.keys(nodes)) {
        f_costs[node] = Infinity;
        g_costs[node] = Infinity;
        edge_to_node[node] = null;
      }
    }
  
    f_costs[start] = 0;
    g_costs[start] = 0;
  
    // priority, curr_line, node
    const pq = new FastPriorityQueue((a: [number, string, string], b: [number, string, string]) => a[0] < b[0]);
    pq.add([0, '', start]);
  
    while (!pq.isEmpty()) {
      const [curr_cost_lines, curr_line, curr_node] = pq.poll();
  
      if (curr_node == goal) {
        return [f_costs, edge_to_node];
      }
  
      const best_new_nodes: { [key: string]: [number, number] } = {};
  
      for (const [line, nodes] of Object.entries(graph.lines)) {
        if (curr_node in nodes) {
          for (const [neighbour, edges] of Object.entries(nodes[curr_node])) {
            for (const edge of edges) {

            if (edge.departureTime.getTime() >= momentZero.getTime()){


              let g = g_costs[curr_node];
              if (curr_line != edge.line) {
                g += 10;
              }
  
              let newCost = g

              edge.timeSinceTimeZero(momentZero);
             //const waiting_time = timeSinceZero - curr_cost_lines;
              //let newCost = g + waiting_time;


              if (newCost < g_costs[edge.stop]) {
                g_costs[edge.stop] = newCost;

                f_costs[edge.stop] = newCost +  costEstimationFunction(graph.nodes[edge.stop], graph.nodes[goal]);
                edge_to_node[edge.stop] = edge;
                pq.add([f_costs[edge.stop], edge.line, edge.stop]);
                best_new_nodes[edge.stop] = [f_costs[edge.stop], newCost];
              }


            }

            }
          }
        }
      }
  
      for (const [node, prio_cost] of Object.entries(best_new_nodes)) {
        pq.add([...prio_cost, node]);
      }
    }
  
    return null;
  }