const csv = require('csv-parser');
const fs = require('fs');
const { time } = require('console');

const indice_id = 0;
const indice_company = 1;
const indice_line = 2;
const indice_departure_time = 3;
const indice_arrival_time = 4;
const indice_start = 5;
const indice_end = 6;
const indice_start_lat = 7;
const indice_start_lon = 8;
const indice_end_lat = 9;
const indice_end_lon = 10;




// const obj = {
//     line1: {
//       node1: {
//         node2: [edge1, edge2],
//         node3: [edge3],
//       },
//       node2: {
//         node3: [edge4],
//       },
//     },
//     line2: {
//       node3: {
//         node4: [edge5],
//         node5: [edge6],
//       },
//     },
//   };
//


/*
 * Graph class used to build a graph object from CSV data.
 */
class Graph {
    /*
     * Constructor for the Graph class.
     * @param {Array} csv_data - Data in the form of a list of tuples.
     * @param {Object} time_zero - The time to be used as a reference.
     */
    constructor(csv_data, time_zero) {
        // Object to store lines and their start and end nodes with edges between them.
        this.lines = {};

        // Object to store nodes with their latitude and longitude coordinates.
        this.nodes = {};

        // Function to build the graph from the given csv_data.
        this._build_graph(csv_data, time_zero);

        // Function to sort the edges between the start and end nodes in each line.
        this._sort_edges();
    }

    /*
     * Function to build the graph from the given csv_data.
     * @param {Array} csv_data - Data in the form of a list of tuples.
     * @param {Object} time_zero - The time to be used as a reference.
     */
    _build_graph(csv_data, time_zero) {
        // Loop through each row in the csv_data.
        for (let row of csv_data) {
            // Get the start node, end node, line, start departure time, and end arrival time from the row.
            const start = row[indice_start];
            const end = row[indice_end];
            const line = row[indice_line];
            const start_departure = row[indice_departure_time];
            const end_arrival = row[indice_arrival_time];

            // Create a new Edge object using the start node, end node, line, start departure time, end arrival time,
            // and the time_zero object.
            const edge = new Edge(time_zero, start, end, line, start_departure, end_arrival);

            // If the line is not already in the lines object, create a new entry for it.
            if (!(line in this.lines)) {
                this.lines[line] = {};
            }

            // If the start node is not already in the line entry, create a new entry for it.
            if (!(start in this.lines[line])) {
                this.lines[line][start] = {};
            }

            // If the end node is not already in the line entry, create a new entry for it.
            if (!(end in this.lines[line])) {
                this.lines[line][end] = {};
            }

            // If the end node is not already in the start node entry, create a new entry for it.
            if (!(end in this.lines[line][start])) {
                this.lines[line][start][end] = [];
            }

            // Add the new Edge object to the edges array for the start node and end node entry.
            this.lines[line][start][end].push(edge);

            // If the start node is not already in the nodes object, create a new entry for it.
            if (!(start in this.nodes)) {
                this.nodes[start] = new Node(start, row[indice_start_lat], row[indice_start_lon]);
            }

            // If the end node is not already in the nodes object, create a new entry for it.
            if (!(end in this.nodes)) {
                this.nodes[end] = new Node(end, row[indice_end_lat], row[indice_end_lon]);
            }
        }
    }

    /*
     * Function to sort the edges between the start and end nodes in each line.
     */
    _sort_edges() {
        // Loop through each line in the lines object.
        for (let [line, nodes] of Object.entries(this.lines)) {
            // Loop through each start node in the line
            for (let [node, neighbours] of Object.entries(nodes)) {
                for (let [neighbour, edges_to_neighbour] of Object.entries(neighbours)) {
                    edges_to_neighbour.sort();
                }
            }
        }
    }

    // neighbours(node) {}

    // get_node(name) {}
}




class Node {
    constructor(name, latitude, longitude) {
        this.name = name;
        this.lat = latitude;
        this.lon = longitude;
    }

    hashCode() {
        return this.name.hashCode();
    }

    equals(other) {
        return this.name === other.name;
    }
}

class Edge {
    constructor(timeZero, start, end, line, departureTime, arrivalTime) {
        this.start = start;
        this.stop = end;
        this.line = line;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.timeSinceTimeZero = calcSec(timeZero, departureTime);
        this.cost = calcSec(departureTime, arrivalTime);
    }

    compareTo(other) {
        return this.timeSinceTimeZero - other.timeSinceTimeZero;
    }

    toString() {
        return `line: "${this.line}", departure bus stop: "${this.start}", departure time: "${this.departureTime}", arrival bus stop: "${this.stop}", arrival time: "${this.arrivalTime}"`;
    }
}
// A function that takes two Date objects representing start and end times and returns the difference between them in seconds
function calcSec(start, end) {
    const startSec = (start.getHours() * 60 + start.getMinutes()) * 60 + start.getSeconds();
    const endSec = (end.getHours() * 60 + end.getMinutes()) * 60 + end.getSeconds();
    const fullSec = 24 * 3600; // the number of seconds in a day
    if (startSec > endSec) { // if start time is later than end time
    const diff = fullSec - (startSec - endSec); // calculate the difference with the full seconds in a day
    return diff;
    } else { // if end time is later than start time
    const diff = endSec - startSec; // calculate the difference directly
    return diff;
    }
    }
    
    // A function that takes a path (an array of edges) and a start time and prints information about the trip
    function printResult(path, startTime) {
    const startDate = new Date();
    startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0); // set the seconds and milliseconds to 0
    const endDate = new Date();
    endDate.setHours(path[path.length - 1].arrival_time.getHours(), path[path.length - 1].arrival_time.getMinutes(), 0, 0); // set the seconds and milliseconds to 0
    const totalSeconds = (endDate.getTime() - startDate.getTime()) / 1000; // calculate the total trip duration in seconds
    const totalMinutes = totalSeconds / 60; // convert the total trip duration to minutes
    const lines = new Set(path.map((edge) => edge.line)); // create a Set of all lines used in the path
    path.forEach((edge) => console.log(edge)); // print information about each edge in the path
    console.log(`Whole trip will take ${totalMinutes} minutes across ${lines.size} lines`); // print the total trip duration and the number of lines used
    }
module.exports = { Graph, Node, Edge };
