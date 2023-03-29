//Importing dependencies
const PriorityQueue = require('fastpriorityqueue');
const { time } = require('./Utils');
const { Criteria } = require('./utils.js');
const { Graph, Edge, Node } = require('./graph');

//Function for A* algorithm
function astar(start, goal, neighbors_fn, heuristic_fn) {
    //Create a priority queue and add start node to it
    const front = createPriorityQueue((a, b) => a[0] < b[0]);
    front.add([0, start]);

    //Create a dictionary to store the node from where we reached current node
    const came_from = { [start]: null };
    //Create a dictionary to store the cost to reach the current node
    const cost_so_far = { [start]: 0 };

    //Loop through the queue until it is not empty
    while (!front.isEmpty()) {
        //Get the node with minimum priority
        const [_, current] = front.poll();

        //If we reach the goal node, break the loop
        if (current === goal) {
            break;
        }

        //Loop through the neighbors of the current node
        for (const neighbor of neighbors_fn(current)) {
            //Calculate the cost to reach the neighbor node
            const new_cost = cost_so_far[current] + 1;
            //If we haven't reached the neighbor node before or the new cost is less than the previous cost to reach the node
            if (!cost_so_far[neighbor] || new_cost < cost_so_far[neighbor]) {
                //Update the cost to reach the neighbor node
                cost_so_far[neighbor] = new_cost;
                //Calculate the priority of the neighbor node
                const priority = new_cost + heuristic_fn(goal, neighbor);
                //Add the neighbor node with its priority to the queue
                front.add([priority, neighbor]);
                //Store the node from which we reached the neighbor node
                came_from[neighbor] = current;
            }
        }
    }

    //Create a list to store the path from start to goal
    const path = [];
    let current = goal;
    while (current !== start) {
        //Add the current node to the path
        path.push(current);
        //Update the current node with the node from which we reached it
        current = came_from[current];
    }
    //Add the start node to the path
    path.push(start);
    //Reverse the path to get the path from start to goal
    path.reverse();

    //Return the path and the cost to reach the goal node
    return [path, cost_so_far[goal]];
}


/**

This function finds the shortest path from the start node to the goal node

using the A* algorithm based on time criteria. The graph is represented as a set

of nodes connected by edges with associated costs. The function uses a priority

queue to keep track of nodes to visit and their priority.

@param {Graph} graph - The graph to search for the shortest path.

@param {Criteria} criteria - The criteria to use to calculate the priority of each node.

@param {string} start - The node to start the search from.

@param {string} goal - The node to search for.

@param {Function} heuristic_fn - The heuristic function to use to estimate the distance

from each node to the goal node.

@returns {[Object.<string, number>, Object.<string, Edge>]} An array containing two

objects: the first object maps each node to its shortest distance from the start node,

and the second object maps each node to the edge that was used to get to that node

from the previous node on the shortest path.
*/
function astarTime(graph, criteria, start, goal, heuristic_fn) {
    // Initialize costs to infinity for all nodes except the start node
    //const costs = Object.fromEntries(Array.from(graph.lines.values(), (nodes) => nodes.flatMap((node) => [node, Infinity])));
    const costs = Object.fromEntries(
        Object.values(graph.lines).flatMap((nodes) =>
            Object.keys(nodes).flatMap((node) => [node, Infinity])
        ))

    // Initialize the edge_to_node mapping to null for all nodes
    const edge_to_node = Object.fromEntries(Object.values(graph.lines).flatMap((nodes) => nodes.flatMap((node) => [node, null])));

    // Set the cost of the start node to 0
    costs[start] = 0;

    // Initialize the priority queue with the start node
    const pq = new PriorityQueue((a, b) => a[0] < b[0]);
    pq.add([0, 0, start]);

    // Loop until the goal node is reached
    while (!pq.isEmpty() && pq.peek()[2] !== goal) {
        // Get the node with the lowest cost from the priority queue
        const [_, curr_cost, curr_node] = pq.poll();

        // If the cost to reach the current node is greater than the cost stored in the costs object, skip to the next iteration
        if (curr_cost > costs[curr_node]) {
            continue;
        }

        // Initialize an empty object to store the best new nodes
        const best_new_nodes = {};

        // Loop through each line in the graph
        for (const [line, nodes] of Object.entries(graph.lines)) {
            // If the current node is a node on the line
            if (nodes[curr_node]) {
                // Loop through each neighbor of the current node on the line
                for (const [neighbour, edges] of Object.entries(nodes[curr_node])) {
                    // Loop through each edge connecting the current node to the neighbor
                    for (const edge of edges) {
                        // If the edge was last traversed before the current time, skip to the next iteration
                        if (edge.time_since_time_zero < curr_cost) {
                            continue;
                        }

                        // Calculate the waiting time before the next departure
                        const waiting_time = edge.time_since_time_zero - curr_cost;

                        // Calculate the new cost to reach the neighbor node through the current edge
                        const new_cost = curr_cost + edge.cost + waiting_time;

                        // If the new cost is less than the current cost stored in the costs object for the neighbor node
                        if (new_cost < costs[edge.stop]) {
                            // Update the cost of the neighbor node to the new cost
                            costs[edge.stop] = new_cost;

                            // Update the edge_to_node mapping for the neighbor node to the current edge
                            edge_to_node[edge.stop] = edge;

                            // Calculate the priority of the neighbor node based on the sum of the new cost and the heuristic distance to the goal node
                            const priority = new_cost + heuristic_fn(graph.nodes[edge.stop], graph.nodes[goal]);

                            best_new_nodes[edge.stop] = [priority, new_cost];
                        }
                    }
                }
            }
        }
        // This loop iterates through each element in the best_new_nodes object using Object.entries() method
        // The object is destructured into two values, 'node' and an array containing 'priority' and 'new_cost'
        for (const [node, [priority, new_cost]] of Object.entries(best_new_nodes)) {
            // The add() method is called on the pq object to add a new item to the priority queue
            // The item is an array that contains 'priority', 'new_cost', and 'node' values
            pq.add([priority, new_cost, node]);
        }
    }
    return [costs, edge_to_node];
}


// This function performs the A* algorithm on a graph of nodes and edges,
// where the goal is to find the shortest path from a given start node to a given goal node.
// The graph is represented by an object with two keys, 'nodes' and 'lines'.
// 'nodes' is an object that maps node ids to their coordinates on a 2D plane.
// 'lines' is an object that maps line ids to their nodes.
// The criteria parameter is a function that is used to determine the cost of each edge.
// The start and goal parameters are the ids of the start and goal nodes, respectively.
// The heurestic_fn parameter is a function that estimates the remaining distance from a node to the goal node.

function astarLines(graph, criteria, start, goal, heurestic_fn) {
    // Initialize data structures to track costs, edges, and lines for each node.
    let costs = {};
    let edge_to_node = {};
    let line_to_node = {};




    // Set initial cost, edge, and line values for each node to Infinity, null, and null, respectively.
    for (const [line, nodes] of Object.entries(graph.lines)) {
        for (const node of Object.keys(nodes)) {
            costs[node] = Infinity;
            edge_to_node[node] = null;
            line_to_node[node] = null;
        }
    }

    // Set the cost of the start node to 0 and determine the line it belongs to.
    costs[start] = 0;
    for (const [line, nodes] of Object.entries(graph.lines)) {
        if (start in nodes) {
            line_to_node[start] = [line, 0];
            break;
        }
    }

    // Use a priority queue to store nodes to explore, initialized with the start node.
    const pq = new PriorityQueue((a, b) => a[0] < b[0]);
    pq.add([0, 0, start]);

    // While the goal node has not been reached, continue exploring nodes.
    while (pq.top()[2] !== goal) {
        // Get the current node with the lowest total cost and its current cost and time.
        const [curr_cost_lines, curr_time, curr_node] = pq.poll();

        // If the current time for the node is greater than its current cost, skip it.
        if (curr_time > costs[curr_node]) {
            continue;
        }

        // Find the best new nodes to explore from the current node.
        const best_new_nodes = {};
        for (const [line, nodes] of Object.entries(graph.lines)) {
            if (curr_node in nodes) {
                for (const [neighbour, edges] of Object.entries(nodes[curr_node])) {
                    for (const edge of edges) {
                        // If the edge has already passed or is not on the same line as the current node, skip it.
                        if (edge.time_since_time_zero < curr_time || edge.line !== line_to_node[curr_node][0]) {
                            continue;
                        }

                        // Calculate the waiting time and the new total cost for the edge.
                        const waiting_time = edge.time_since_time_zero - curr_time;
                        const new_cost = curr_time + edge.cost + waiting_time;

                        // If the new cost is less than the current cost for the neighbouring node, update the cost and edge.
                        if (new_cost < costs[edge.stop]) {
                            costs[edge.stop] = new_cost;
                            edge_to_node[edge.stop] = edge;

                            // Calculate the priority for the new node based on its cost and heuristic estimate.
                            const priority = new_cost + heurestic_fn(graph.nodes[edge.stop], graph.nodes[goal]);


                            best_new_nodes[edge.stop] = [priority, new_cost];
                        }
                    }
                }
            }
        }
        for (const [node, prio_cost] of Object.entries(best_new_nodes)) {
            pq.add([...prio_cost, node]);
        }
    }
    return [costs, edge_to_node];
}

function manhattanDistance(a, b) {
    return Math.abs(a.lat - b.lat) + Math.abs(a.lon - b.lon);
}

function euclideanDistance(a, b) {
    return Math.sqrt((a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2);
}

function towncenterDistance(a, b) {
    return euclideanDistance(a, [0, 0, 0, 0, 0, 0, 0]) + euclidean_distance([0, 0, 0, 0, 0, 0, 0], b);
}

function unidimensionalDistance(a, b) {
    return Math.max(Math.abs(a.lat - b.lat), Math.abs(a.lon - b.lon));
}

function cosineDistance(a, b) {
    const dot_product = a.reduce((acc, cur, idx) => acc + cur * b[idx], 0);
    const magnitude_a = Math.sqrt(a.reduce((acc, cur) => acc + cur ** 2, 0));
    const magnitude_b = Math.sqrt(b.reduce((acc, cur) => acc + cur ** 2, 0));
    return 1 - (dot_product / (magnitude_a * magnitude_b));
}

function chebyshevDistance(a, b) {
    return Math.max(...a.map((x, i) => Math.abs(x - b[i])));
}

/**

Calculates the shortest path between two nodes in a graph using A* algorithm with time as the criteria.

@param {object} graph - The graph object containing nodes and edges.

@param {string} start - The starting node.

@param {string} goal - The goal node.

@returns {[number, array]} - An array containing the shortest cost to the goal node and the path as an array of edges.
*/
function astarShortestPath(graph, start, goal, timeZero, criteria, heuristicFn) {
    let costs, edgeToNode;
    
    if (criteria === Criteria.t) {
      [costs, edgeToNode] = astarTime(graph, timeZero, start, goal, heuristicFn);
    } else if (criteria === Criteria.p) {
      [costs, edgeToNode] = astarLines(graph, start, goal, timeZero, heuristicFn);
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

module.exports = { astar, astarTime: astarTime, astarLines, astarShortestPath, manhattanDistance, euclideanDistance };