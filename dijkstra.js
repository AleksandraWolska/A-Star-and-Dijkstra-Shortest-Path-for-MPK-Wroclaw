const {Graph, Edge} = require('./graph.js');
const {Criteria} = require('./utils.js');
const PriorityQueue = require('fastpriorityqueue');

class CriteriaEnforcer {
    constructor(criteria, graph, start) {
        this.criteria = criteria;
        this.edge_to_node = {};
        for (const nodes of Object.values(graph.lines)) {
            for (const node of nodes) {
                this.edge_to_node[node] = null;
            }
        }
        if (this.criteria == Criteria.t) {
            this._init_by_time(graph, start);
        } else if (this.criteria == Criteria.p) {
            this._init_by_lines(graph, start);
        } else {
            throw new Error(`Critical error with invalid criteria value: "${criteria}"!`);
        }
    }

    _init_by_time(graph, start) {
        this.costs = {};
        for (const nodes of Object.values(graph.lines)) {
            for (const node of nodes) {
                this.costs[node] = Infinity;
            }
        }
        this.costs[start] = 0;
    }

    _init_by_lines(graph, start) {
        this.costs = {};
        this.lines_to_node = {};
        for (const nodes of Object.values(graph.lines)) {
            for (const node of nodes) {
                this.costs[node] = 1000000;
                this.lines_to_node[node] = null;
            }
        }
        this.costs[start] = 0;
    }

    compare_is_left_lower(left, right) {
        if (this.criteria == Criteria.t) {
            return left.time_since_time_zero < right;
        } else if (this.criteria == Criteria.p) {
            // Implement your comparison logic here
        }
    }
}

function dijkstra(graph, criteria, start) {
    const costs = {};
    const edge_to_node = {};
    for (const nodes of Object.values(graph.lines)) {
        for (const node of nodes) {
            costs[node] = Infinity;
            edge_to_node[node] = null;
        }
    }
    const pq = new PriorityQueue((a, b) => a[0] < b[0]);
    pq.add([0, start]);
    while (!pq.isEmpty()) {
        const [curr_cost, curr_node] = pq.poll();
        if (curr_cost > costs[curr_node]) {
            continue;
        }
        const best_new_nodes = {};
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (nodes.hasOwnProperty(curr_node)) {
                for (const [neighbour, edges] of Object.entries(nodes[curr_node])) {
                    for (const edge of edges) {
                        if (edge.time_since_time_zero < curr_cost) {
                            continue;
                        }
                        const waiting_time = edge.time_since_time_zero - curr_cost;
                        const new_cost = curr_cost + edge.cost + waiting_time;
                        if (new_cost < costs[edge.stop]) {
                            costs[edge.stop] = new_cost;
                            edge_to_node[edge.stop] = edge;
                            best_new_nodes[edge.stop] = new_cost;
                        }
                    }
                }
            }
        }
        for (const [node, cost] of Object.entries(best_new_nodes)) {
            pq.add([cost, node]);
        }
    }
    return [costs, edge_to_node];
}

function dijkstraShortestPath(graph, start, goal) {
    const [costs, edgeToNode] = dijkstra(graph, Criteria.t, start);
    const path = [];
    let currNode = goal;
    while (currNode !== start) {
      path.push(edgeToNode[currNode]);
      currNode = edgeToNode[currNode].start;
    }
    path.reverse();
    return [costs[goal], path];
  }
  
  function manhattanDist(graph, node, goal) {
    const [distance, path] = shortestPath(graph, node, goal);
    return [distance, path];
  }

  module.exports = {
    CriteriaEnforcer,
    dijkstra,
    dijkstraShortestPath,
    manhattanDist
    };