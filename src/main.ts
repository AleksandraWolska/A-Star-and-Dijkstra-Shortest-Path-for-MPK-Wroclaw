const csv = require('csv-parser');
const fs = require('fs');
const { Graph, Edge } = require('./graph');
const { dijkstraShortestPath } = require('./dijkstra');
const { astarShortestPath } = require('./astar');
const { Criteria } = require('./utils');
//const moment = require('moment');
import moment from 'moment';

import { manhattan_distance } from './astar';

import { graph, node, edge } from "./types"

// const indice_id = 0;
// const indice_company = 1;
// const indice_line = 2;
// const indice_departure_time = 3;
// const indice_arrival_time = 4;
// const indice_start = 5;
// const indice_end = 6;
// const indice_start_lat = 7;
// const indice_start_lon = 8;
// const indice_end_lat = 9;
// const indice_end_lon = 10;


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
    //console.log();
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
// function loadCsv() {
//     const data = [];
//     fs.createReadStream('data.csv')
//         .pipe(csv())
//         .on('data', (row) => {
//             data.push(row);
//         })
//         .on('end', () => {
//             console.log('CSV file successfully processed');
//         });
//     return data;
// }

function task1(graph: graph, start: string, end: string, startTime: Date): void {


 
    // const graphData = fs.readFileSync('./graph.json');
    // const graph : graph = JSON.parse(graphData);
    //  console.log(graph);

    const beginTime = new Date();
    const [cost, path] = dijkstraShortestPath(graph, start, end, startTime);
    const endTime = new Date();
    console.log('Dijkstra Algorithm:');
    console.log(path, startTime);
    console.log(`Execution of Dijkstra algorithm took: ${endTime.getTime() - beginTime.getTime()}`);
}

function task2(graph: graph, start: string, end: string, startTime: Date) {
    const beginTime = new Date();
    const [cost, path] = astarShortestPath(graph, start, end, startTime, "t", manhattan_distance );
    const endTime = new Date();
    console.log('A* Algorithm:');
    console.log(path, startTime);
    console.log(`Execution of A* algorithm took: ${endTime.getTime() - beginTime.getTime()}`);
}

function task3(graph: graph, start: string, end: string, startTime: Date) {
    const beginTime = new Date();
    const [cost, path] = astarShortestPath(graph, start, end, startTime, "p", manhattan_distance );
    const endTime = new Date();
    console.log('A* Algorithm:');
    console.log(path, startTime);
    console.log(`Execution of A* algorithm took: ${endTime.getTime() - beginTime.getTime()}`);
}

function main() {

    const data = loadCSV();
    
    let graph: graph = new Graph(data);

    // const data = loadCSV();

    
    // const graph: graph = new Graph(data);
    // Save the graph to a file

    //fs.writeFileSync('graph.json', JSON.stringify(graph));

    // task1(graph, 'Prusa', 'DWORZEC GŁÓWNY', new Date('2023-03-28T19:58:00'))
    // graph = new Graph(data);
    // task2(graph, 'Prusa', 'DWORZEC GŁÓWNY', new Date('2023-03-28T19:58:00'))
    // graph = new Graph(data);
    // task3(graph, 'Prusa', 'DWORZEC GŁÓWNY', new Date('2023-03-28T19:58:00'))

    task1(graph, 'Prusa', 'Kwiska', new Date('2023-03-28T19:58:00'))
    graph = new Graph(data);
    task2(graph, 'Prusa', 'Kwiska', new Date('2023-03-28T19:58:00'))
    graph = new Graph(data);
    task3(graph, 'Prusa', 'Kwiska', new Date('2023-03-28T19:58:00'))

}


main();