import { node, edge } from "./types"

const idx_line = 2;
const idx_departure_time = 3;
const idx_arrival_time = 4;
const idx_start = 5;
const idx_end = 6;
const idx_start_lat = 7;
const idx_start_lon = 8;
const idx_end_lat = 9;
const idx_end_lon = 10;

export class Graph {
  lines: { [line: string]: { [node: string]: { [neighbour: string]: edge[] } } };
  nodes: { [node: string]: node };

  constructor(csv_data: any[], datetime : Date) {
    this.lines = {};
    this.nodes = {};
    this.createGraph(csv_data, datetime);
    this.sortEdges();
  }

  createGraph(csv_data: any[], datetime: Date) {

    for (let row of csv_data) {

      const start: string = row[idx_start];
      const end: string = row[idx_end];
      const line: string = row[idx_line];
      const start_departure: Date = row[idx_departure_time];
      const end_arrival: Date = row[idx_arrival_time];

      const edge: Edge = new Edge(start, end, line, start_departure, end_arrival, datetime);

      if (!(line in this.lines)) this.lines[line] = {};
      if (!(start in this.lines[line])) this.lines[line][start] = {};
      if (!(end in this.lines[line])) this.lines[line][end] = {};

      if (!(end in this.lines[line][start])) this.lines[line][start][end] = [];

      this.lines[line][start][end].push(edge);

      if (!(start in this.nodes))  this.nodes[start] = new Node(start, row[idx_start_lat], row[idx_start_lon]);
      if (!(end in this.nodes))  this.nodes[end] = new Node(end, row[idx_end_lat], row[idx_end_lon]);
   
    }
  }

  sortEdges() {
    for (let [line, nodes] of Object.entries(this.lines)) {
      for (let [node, neighbours] of Object.entries(nodes)) {
        for (let [neighbour, connectionEdges] of Object.entries(neighbours)) {
          connectionEdges.sort(Edge.compare);
        }
      }
    }
  }

  neighbours(node: string): string[] {
    return Object.keys(this.nodes).filter((key) => key !== node);
  }

  get_node(name: string): node | null {
    return this.nodes[name] || null;
  }
}

export class Node {
  name: string;
  latitude: number;
  longitude: number;

  constructor(name: string, latitude: number, longitude: number) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  isEqual(other: Node): boolean {
    return this.name === other.name;
  }
}



export class Edge {
  line: string;
  start: string;
  stop: string;
  departureTime: Date;
  arrivalTime: Date;
  timeFromMomentZero: number | null;
  rideCost: number;
  datetime?: Date;

  constructor(start: string, end: string, line: string, departureTime: Date, arrivalTime: Date, datetime: Date) {
    this.line = line;
    this.start = start;
    this.stop = end;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.datetime = datetime
    this.timeFromMomentZero = calculateMinutesDifference(datetime, this.departureTime);
    this.rideCost = calculateMinutesDifference(departureTime, arrivalTime);
  }


  setTimeFromMomentZero(newTimeZero: Date): number {
    if (this.timeFromMomentZero === null) {
      this.timeFromMomentZero = calculateMinutesDifference(newTimeZero, this.departureTime)
    }
    return this.timeFromMomentZero;
  }


  static compare(a: Edge, b: Edge): number {
    return a.timeFromMomentZero! < b.timeFromMomentZero! ? -1 : a.timeFromMomentZero! > b.timeFromMomentZero! ? 1 : 0;
  }

  toString(): string {
    return `[${this.line.toString().padEnd(3)}] [${this.start.substring(0, 30).padEnd(30)} ${this.departureTime.toLocaleTimeString()}] -> ${this.rideCost.toString().padEnd(2)}min -> [${this.stop.substring(0, 30).padEnd(30)} ${this.arrivalTime.toLocaleTimeString()}] w podróży: ${this.timeFromMomentZero.toString()} min `;
  }
}

function calculateMinutesDifference(start: Date, end: Date): number {
  const beginDate = new Date(start)
  const endDate = new Date(end)
  const beginMinutes = (beginDate.getHours() * 60 + beginDate.getMinutes());
  const endMinutes = (endDate.getHours() * 60 + endDate.getMinutes());
  return beginMinutes > endMinutes ? 1440 - (beginMinutes - endMinutes) :  endMinutes - beginMinutes
}


export function getChangesAmount(path: edge[] | null): number {
  let lineChanges = 0;
  let previousLine: string | undefined;
  if (path !== null) {
    previousLine = path[0].line;
    path.forEach((edge) => {
      if (edge.line !== previousLine) {
        lineChanges += 1;
        previousLine = edge.line;
      }
    });
  }
  return lineChanges
}

