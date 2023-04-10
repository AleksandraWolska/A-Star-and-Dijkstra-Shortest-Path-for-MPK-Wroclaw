import fs from 'fs';
import { Graph, getChangesAmount } from './graph';
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import moment from 'moment';

import { euclidean_distance, manhattan_distance } from './distances';

import { graph, edge } from "./types"


const indice_id = 0;
const indice_id2 = 1;
const indice_company = 2;
const indice_line = 3;
const indice_departure_time = 4;
const indice_arrival_time = 5;
const indice_start = 6;
const indice_end = 7;
const indice_start_lat = 8;
const indice_start_lon = 9;
const indice_end_lat = 10;
const indice_end_lon = 11;

//poprawienie formatu czasów
function clearRow(row: string[]): any[] {
    let departureTime = row[indice_departure_time];
    let arrivalTime = row[indice_arrival_time];
    departureTime = `${(parseInt(departureTime?.slice(0, 2)) % 24)}${departureTime?.slice(2)}`;
    arrivalTime = `${(parseInt(arrivalTime?.slice(0, 2)) % 24)}${arrivalTime?.slice(2)}`;
    return [...row.slice(0, indice_departure_time), departureTime, arrivalTime, ...row.slice(indice_arrival_time + 1)];
}


function loadCSV(filename = 'connection_graph.csv') {
    const data = [];
    const file = fs.readFileSync(filename, { encoding: 'utf-8' });
    const rows = file.split('\n');
    rows.splice(0, 1)
    for (const row of rows) {

        //console.log(row)
        const fields = clearRow(row.split(','));
        const entry = [
            parseInt(fields[indice_id]),
            fields[indice_company],
            fields[indice_line],
            moment(fields[indice_departure_time], 'HH:mm:ss').toDate(),
            moment(fields[indice_arrival_time], 'HH:mm:ss').toDate(),
            fields[indice_start],
            fields[indice_end],
            parseFloat(fields[indice_start_lat]),
            parseFloat(fields[indice_start_lon]),
            parseFloat(fields[indice_end_lat]),
            parseFloat(fields[indice_end_lon]),

        ];

        //console.log(entry)
        data.push(entry);
    }
    return data;
}

function task1(graph: graph, start: string, end: string, startTime: Date): void {

    const beginTime = new Date();
    const [cost, path] = dijkstra(graph, start, end, startTime);
    const endTime = new Date();
    console.log('Dijkstra Algorithm:');
    console.log(path.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of Dijkstra algorithm took: ${endTime.getTime() - beginTime.getTime()}, line changed ${getChangesAmount(path)} times and had cost of: ${cost}`);
}

function task2(graph: graph, start: string, end: string, startTime: Date) {
    const beginTime = new Date();
    const [cost, path] = astar(graph, start, end, "t", manhattan_distance );
    const endTime = new Date();

    const beginTime2 = new Date();
    const [cost2, path2] = astar(graph, start, end, "t", euclidean_distance );
    const endTime2 = new Date();
    console.log('A* Algorithm - time:');
    console.log(path2.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of A* algorithm took: ${endTime2.getTime() - beginTime2.getTime()}, line changed ${getChangesAmount(path2)} times and had cost of: ${cost2}`);
}

function task3(graph: graph, start: string, end: string, startTime: Date) {
    const beginTime = new Date();
    const [cost, path]  = astar(graph, start, end, "p", manhattan_distance );
    const endTime = new Date();
    console.log('A* Algorithm - changes:');
    console.log(path.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of A* algorithm took: ${endTime.getTime() - beginTime.getTime()}, line changed ${getChangesAmount(path)} times and had cost of: ${cost}`);
}

function main() {
    const data = loadCSV();
    let datetime = moment('17:00:00', 'HH:mm:ss').toDate()
    let graph: graph = new Graph(data, datetime);
    console.log("main datetime:" + datetime )
    task1(graph, 'Prusa', 'Kwiska', datetime)
    task2(graph, 'Prusa', 'Kwiska', datetime)
    task3(graph, 'Prusa', 'Kwiska', datetime)
}


main();