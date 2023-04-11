"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangesAmount = exports.Edge = exports.Node = exports.Graph = void 0;
const idx_id = 0;
const idx_company = 1;
const idx_line = 2;
const idx_departure_time = 3;
const idx_arrival_time = 4;
const idx_start = 5;
const idx_end = 6;
const idx_start_lat = 7;
const idx_start_lon = 8;
const idx_end_lat = 9;
const idx_end_lon = 10;
class Graph {
    constructor(csv_data, datetime) {
        this.lines = {};
        this.nodes = {};
        this.createGraph(csv_data, datetime);
        this.sortEdges();
    }
    createGraph(csv_data, datetime) {
        for (let row of csv_data) {
            const start = row[idx_start];
            const end = row[idx_end];
            const line = row[idx_line];
            const start_departure = row[idx_departure_time];
            const end_arrival = row[idx_arrival_time];
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
                this.nodes[start] = new Node(start, row[idx_start_lat], row[idx_start_lon]);
            if (!(end in this.nodes))
                this.nodes[end] = new Node(end, row[idx_end_lat], row[idx_end_lon]);
        }
    }
    sortEdges() {
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
        this.latitude = latitude;
        this.longitude = longitude;
    }
    isEqual(other) {
        return this.name === other.name;
    }
}
exports.Node = Node;
class Edge {
    constructor(start, end, line, departureTime, arrivalTime, datetime) {
        this.line = line;
        this.start = start;
        this.stop = end;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.datetime = datetime;
        this.timeFromMomentZero = calculateMinutesDifference(datetime, this.departureTime);
        this.rideCost = calculateMinutesDifference(departureTime, arrivalTime);
    }
    setTimeFromMomentZero(newTimeZero) {
        if (this.timeFromMomentZero === null) {
            this.timeFromMomentZero = calculateMinutesDifference(newTimeZero, this.departureTime);
        }
        return this.timeFromMomentZero;
    }
    static compare(a, b) {
        return a.timeFromMomentZero < b.timeFromMomentZero ? -1 : a.timeFromMomentZero > b.timeFromMomentZero ? 1 : 0;
    }
    toString() {
        return `[${this.line.toString().padEnd(3)}] [${this.start.substring(0, 30).padEnd(30)} ${this.departureTime.toLocaleTimeString()}] -> ${this.rideCost.toString().padEnd(2)}min -> [${this.stop.substring(0, 30).padEnd(30)} ${this.arrivalTime.toLocaleTimeString()}] w podróży: ${this.timeFromMomentZero.toString()} min `;
    }
}
exports.Edge = Edge;
function calculateMinutesDifference(start, end) {
    const beginDate = new Date(start);
    const endDate = new Date(end);
    const beginMinutes = (beginDate.getHours() * 60 + beginDate.getMinutes());
    const endMinutes = (endDate.getHours() * 60 + endDate.getMinutes());
    return beginMinutes > endMinutes ? 1440 - (beginMinutes - endMinutes) : endMinutes - beginMinutes;
}
function getChangesAmount(path) {
    let lineChanges = 0;
    let previousLine;
    if (path !== null) {
        previousLine = path[0].line;
        path.forEach((edge) => {
            if (edge.line !== previousLine) {
                lineChanges += 1;
                previousLine = edge.line;
            }
        });
    }
    return lineChanges;
}
exports.getChangesAmount = getChangesAmount;
//# sourceMappingURL=graph.js.map