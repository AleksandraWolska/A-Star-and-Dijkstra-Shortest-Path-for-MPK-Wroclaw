"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangesAmount = exports.Edge = exports.Node = exports.Graph = void 0;
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
class Graph {
    constructor(csv_data, datetime) {
        this.lines = {};
        this.nodes = {};
        this.createGraph(csv_data, datetime);
        this.sortEdges(datetime);
    }
    createGraph(csv_data, datetime) {
        for (let row of csv_data) {
            const start = row[indice_start];
            const end = row[indice_end];
            const line = row[indice_line];
            const start_departure = row[indice_departure_time];
            const end_arrival = row[indice_arrival_time];
            const edge = new Edge(start, end, line, start_departure, end_arrival, datetime);
            if (!(line in this.lines))
                this.lines[line] = {};
            if (!(start in this.lines[line]))
                this.lines[line][start] = {};
            if (!(end in this.lines[line]))
                this.lines[line][end] = {};
            if (!(end in this.lines[line][start]))
                this.lines[line][start][end] = [];
            this.lines[line][start][end].push(edge);
            if (!(start in this.nodes))
                this.nodes[start] = new Node(start, row[indice_start_lat], row[indice_start_lon]);
            if (!(end in this.nodes))
                this.nodes[end] = new Node(end, row[indice_end_lat], row[indice_end_lon]);
        }
    }
    sortEdges(datetime) {
        for (let [line, nodes] of Object.entries(this.lines)) {
            for (let [node, neighbours] of Object.entries(nodes)) {
                //connectionEdge jest na linię i czas
                for (let [neighbour, connectionEdges] of Object.entries(neighbours)) {
                    //sortowanie 
                    //connectionEdges.sort((a, b) => a.timeSinceTimeZero(datetime) > b.timeSinceTimeZero(datetime) ? 1 : 0);
                    connectionEdges.sort(Edge.compare);
                }
            }
        }
    }
    neighbours(node) {
        return Object.keys(this.nodes).filter((key) => key !== node);
    }
    get_node(name) {
        return this.nodes[name] || null;
    }
}
exports.Graph = Graph;
class Node {
    constructor(name, latitude, longitude) {
        this.name = name;
        this.lat = latitude;
        this.lon = longitude;
    }
    isEqual(other) {
        return this.name === other.name;
    }
}
exports.Node = Node;
class Edge {
    constructor(start, end, line, departureTime, arrivalTime, datetime) {
        this.start = start;
        this.stop = end;
        this.line = line;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.datetime = datetime;
        this._timeSinceTimeZero = calculateMinutesDifference(datetime, this.departureTime);
        this.cost = calculateMinutesDifference(departureTime, arrivalTime);
    }
    clearTimeSinceTimeZero() {
        this._timeSinceTimeZero = null;
    }
    timeSinceTimeZero(newTimeZero) {
        if (this._timeSinceTimeZero === null) {
            this._timeSinceTimeZero = calculateMinutesDifference(newTimeZero, this.departureTime);
        }
        return this._timeSinceTimeZero;
    }
    static compare(a, b) {
        return a._timeSinceTimeZero < b._timeSinceTimeZero ? -1 : a._timeSinceTimeZero > b._timeSinceTimeZero ? 1 : 0;
    }
    toString() {
        return `[${this.line.toString().padEnd(3)}] [${this.start.substring(0, 30).padEnd(30)} ${this.departureTime.toLocaleTimeString()}] -> ${this.cost.toString().padEnd(2)}min -> [${this.stop.substring(0, 30).padEnd(30)} ${this.arrivalTime.toLocaleTimeString()}] w podróży: ${this._timeSinceTimeZero.toString()} min `;
    }
}
exports.Edge = Edge;
function calculateMinutesDifference(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startSec = (startDate.getHours() * 60 + startDate.getMinutes());
    const endSec = (endDate.getHours() * 60 + endDate.getMinutes());
    return startSec > endSec ? 1440 - (startSec - endSec) : endSec - startSec;
}
function getChangesAmount(path) {
    let lineChanges = 0;
    let lineOfPrevEdge;
    if (path !== null) {
        lineOfPrevEdge = path[0].line;
        path.forEach((edge) => {
            if (edge.line !== lineOfPrevEdge) {
                lineChanges += 1;
                lineOfPrevEdge = edge.line;
            }
        });
    }
    return lineChanges;
}
exports.getChangesAmount = getChangesAmount;
module.exports = { Graph, Node, Edge, getChangesAmount };
//# sourceMappingURL=graph.js.map