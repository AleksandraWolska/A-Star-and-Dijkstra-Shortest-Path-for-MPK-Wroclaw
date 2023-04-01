const { Graph, Edge } = require('./graph.js');
const { Criteria } = require('./utils.js');
const FastPriorityQueue = require('fastpriorityqueue');
import { graph, node, edge } from "./types"


function dijkstra(graph: graph, start: string, goal: string, timeZero: Date): [number, edge[]] {
    return dijkstraShortestPath(graph, start, goal, timeZero);
}

function dijkstraShortestPath(graph: graph, start: string, goal: string, timeZero: Date): [number, edge[]] {
    const [costs, edgeToNode] = dijkstraTime(graph, start, timeZero);
    const path: edge[] = [];
    let currNode: string = goal;
    while (currNode !== start) {
        //   console.log('currNode:', currNode);
        //   console.log('edgeToNode[currNode]:', edgeToNode[currNode]);
        path.push(edgeToNode[currNode]!);
        currNode = edgeToNode[currNode]!.start;
    }
    path.reverse();
    return [costs[goal], path];
}

function dijkstraTime(graph: graph, start: string, timeZero: Date): [{ [key: string]: number }, { [key: string]: edge }] {
    const costs: { [key: string]: number } = {};
    const edgeToNode: { [key: string]: edge } = {};
    const visited = new Set<string>();

    for (const nodes of Object.values(graph.lines)) {
        for (const node in nodes) {
            costs[node] = Infinity;
            edgeToNode[node] = null;
        }
    }
    //  console.log("\n\n\nentries egde===================\n\n\n" + Object.entries(graph.lines) + "\n\ntyle")
    const pq = new FastPriorityQueue((a: [number, string], b: [number, string]) => a[0] < b[0]);
    //  console.log(pq)
    pq.add([0, start]);
    //  console.log(pq)

    while (!pq.isEmpty()) {
        const [currCost, currNode] = pq.poll()!;
        if (visited.has(currNode)) {
            continue;
        } else {
            visited.add(currNode);
        }

        //    console.log("currCost > costs[currNode]" + (currCost > costs[currNode]))
        if (currCost > costs[currNode]) {
            continue;
        }
        const bestNewNodes: { [key: string]: number } = {};

        //   console.log("Object.entries(graph.lines) length" + Object.keys(graph.lines).length)

        for (const [line, nodes] of Object.entries(graph.lines)) {
            //   console.log("2. line: " + line)
            if (currNode in nodes) {
                //    console.log("3. node: " + currNode)
                for (const [neighbour, edges] of Object.entries(nodes[currNode])) {
                    //     console.log("\n4. egdes: " + edges + "\n\n")
                    for (const edge of edges) {
                        //       console.log("\n5. egde: " + edge + "\n\n")
                        //       console.log("current cost" + currCost)
                        const timeSinceZero: number = edge.timeSinceTimeZero(timeZero);
                        //     console.log("timesincezero" + timeSinceZero)
                        if (timeSinceZero < currCost) {
                            continue;
                        }
                        const waitingTime = timeSinceZero - currCost;
                        const newCost = currCost + edge.cost + waitingTime;
                        if (newCost < costs[edge.stop]) {
                            costs[edge.stop] = newCost;
                            edgeToNode[edge.stop] = edge;
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
    console.log("koszt" + Object.entries(costs) + "  \n\nedgetonode" + Object.values(edgeToNode));
    return [costs, edgeToNode];
}


module.exports = {
    dijkstra,
    dijkstraShortestPath,
};