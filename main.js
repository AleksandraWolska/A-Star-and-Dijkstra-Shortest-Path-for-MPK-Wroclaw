const csv = require('csv-parser');
const fs = require('fs');
const { Graph, Edge, Node } = require('./graph');
const { dijkstraShortestPath } = require('./dijkstra');
const { astarShortestPath } = require('./astar');
const { Criteria } = require('./utils');
const moment = require('moment');





let indice_id = 0
let indice_company = 1
let indice_line = 2
let indice_departure_time = 3
let indice_arrival_time = 4
let indice_start = 5
let indice_end = 6
let indice_start_lat = 7
let indice_start_lon = 8
let indice_end_lat = 9
let indice_end_lon = 10

function clearRow(row) {
    const badTime1 = row[indice_departure_time];
    const badTime2 = row[indice_arrival_time];
    const modifiedTime1 = `${(parseInt(badTime1?.slice(0, 2)) % 24)}${badTime1?.slice(2)}`;
    const modifiedTime2 = `${(parseInt(badTime2?.slice(0, 2)) % 24)}${badTime2?.slice(2)}`;
    return [...row.slice(0, indice_departure_time), modifiedTime1, modifiedTime2, ...row.slice(indice_arrival_time + 1)];
}


function loadCSV(filename = 'connection_graph.csv') {
    const data = [];
    const file = fs.readFileSync(filename, { encoding: 'utf-8' });
    const rows = file.split('\n').slice(1);
    for (const row of rows) {

        //console.log(row)
        const fields = clearRow(row.split(','));
        const entry = [parseInt(fields[indice_id]),
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

function task1(start, end, criteria, startTime) {
    const data = loadCSV();

    const graph = new Graph(data, startTime);

    console.log(graph)

    // const beginTime = new Date();
    // const [cost, path] = dijkstraShortestPath(graph, start, end);
    // const endTime = new Date();
    // console.log('Dijkstra Algorithm:');
    // console.logResult(path, startTime);
    // console.log(`Execution of Dijkstra algorithm took: ${endTime - beginTime}`);
}

// function task2(start, end, criteria, startTime) {
//     const data = loadCsv();

//     const graph = new Graph(data, startTime);

//     const beginTime = new Date();
//     const [cost, path] = astarShortestPath(graph, start, end);
//     const endTime = new Date();
//     console.log('A* Algorithm:');
//     console.logResult(path, startTime);
//     console.log(`Execution of A* algorithm took: ${endTime - beginTime}`);
// }

function main() {
    task1('KRZYKI', 'Ramiszów', Criteria.t, new Date('2023-03-28T19:58:00'))
    //task2('KRZYKI', 'Ramiszów', Criteria.t, new Date('2023-03-28T19:58:00'));
}

if (require.main === module) {
    main();
}