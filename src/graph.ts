

import { node, edge } from "./types"

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

export class Graph {
  lines: { [line: string]: { [node: string]: { [neighbour: string]: edge[] } } };
  nodes: { [node: string]: node };

  constructor(csv_data: any[], datetime : Date) {
    this.lines = {};
    this.nodes = {};
    this.createGraph(csv_data, datetime);
    this.sortEdges(datetime);
  }

  createGraph(csv_data: any[], datetime: Date) {

    for (let row of csv_data) {

      const start: string = row[indice_start];
      const end: string = row[indice_end];
      const line: string = row[indice_line];
      const start_departure: Date = row[indice_departure_time];
      const end_arrival: Date = row[indice_arrival_time];

      const edge: Edge = new Edge(start, end, line, start_departure, end_arrival, datetime);

      if (!(line in this.lines)) this.lines[line] = {};
      if (!(start in this.lines[line])) this.lines[line][start] = {};
      if (!(end in this.lines[line])) this.lines[line][end] = {};

      if (!(end in this.lines[line][start])) this.lines[line][start][end] = [];

      this.lines[line][start][end].push(edge);

      if (!(start in this.nodes))  this.nodes[start] = new Node(start, row[indice_start_lat], row[indice_start_lon]);
      if (!(end in this.nodes))  this.nodes[end] = new Node(end, row[indice_end_lat], row[indice_end_lon]);
   
    }
  }

  sortEdges(datetime: Date) {
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

  neighbours(node: string): string[] {
    return Object.keys(this.nodes).filter((key) => key !== node);
  }

  get_node(name: string): node | null {
    return this.nodes[name] || null;
  }
}

export class Node {
  name: string;
  lat: number;
  lon: number;

  constructor(name: string, latitude: number, longitude: number) {
    this.name = name;
    this.lat = latitude;
    this.lon = longitude;
  }

  isEqual(other: Node): boolean {
    return this.name === other.name;
  }
}



export class Edge {
  start: string;
  stop: string;
  line: string;
  departureTime: Date;
  arrivalTime: Date;
  _timeSinceTimeZero: number | null;
  cost: number;
  datetime?: Date;

  constructor(start: string, end: string, line: string, departureTime: Date, arrivalTime: Date, datetime: Date) {
    this.start = start;
    this.stop = end;
    this.line = line;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.datetime = datetime
    this._timeSinceTimeZero = calculateMinutesDifference(datetime, this.departureTime);
    this.cost = calculateMinutesDifference(departureTime, arrivalTime);
  }

  clearTimeSinceTimeZero(): void {
    this._timeSinceTimeZero = null;
  }

  timeSinceTimeZero(newTimeZero: Date): number {
    if (this._timeSinceTimeZero === null) {
      this._timeSinceTimeZero = calculateMinutesDifference(newTimeZero, this.departureTime)
    }
    return this._timeSinceTimeZero;
  }


  static compare(a: Edge, b: Edge): number {
    return a._timeSinceTimeZero! < b._timeSinceTimeZero! ? -1 : a._timeSinceTimeZero! > b._timeSinceTimeZero! ? 1 : 0;
  }

  toString(): string {
    return `[${this.line.toString().padEnd(3)}] [${this.start.substring(0, 30).padEnd(30)} ${this.departureTime.toLocaleTimeString()}] -> ${this.cost.toString().padEnd(2)}min -> [${this.stop.substring(0, 30).padEnd(30)} ${this.arrivalTime.toLocaleTimeString()}] w podróży: ${this._timeSinceTimeZero.toString()} min `;
  }
}

function calculateMinutesDifference(start: Date, end: Date): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startSec = (startDate.getHours() * 60 + startDate.getMinutes());
  const endSec = (endDate.getHours() * 60 + endDate.getMinutes());
  return startSec > endSec ? 1440 - (startSec - endSec) :  endSec - startSec
}


export function getChangesAmount(path: edge[] | null): number {
  let lineChanges = 0;
  let lineOfPrevEdge: string | undefined;
  if (path !== null) {
    lineOfPrevEdge = path[0].line;
    path.forEach((edge) => {
      if (edge.line !== lineOfPrevEdge) {
        lineChanges += 1;
        lineOfPrevEdge = edge.line;
      }
    });
  }
  return lineChanges
}

module.exports = { Graph, Node, Edge, getChangesAmount };
