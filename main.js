const csv = require('csv-parser');
const fs = require('fs');
const { Graph } = require('./graph');
const { dijkstraShortestPath } = require('./dijkstra');
const { astarTimeShortestPath } = require('./astar');
const { Criteria } = require('./utils');

function loadCsv() {
    const data = [];
    fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
    return data;
}

function task1(start, end, criteria, startTime) {
    const data = loadCsv();

    const graph = new Graph(data, startTime);

    const beginTime = new Date();
    const [cost, path] = dijkstraShortestPath(graph, start, end);
    const endTime = new Date();
    console.log('Dijkstra Algorithm:');
    console.logResult(path, startTime);
    console.log(`Execution of Dijkstra algorithm took: ${endTime - beginTime}`);
}

function task2(start, end, criteria, startTime) {
    const data = loadCsv();

    const graph = new Graph(data, startTime);

    const beginTime = new Date();
    const [cost, path] = astarTimeShortestPath(graph, start, end);
    const endTime = new Date();
    console.log('A* Algorithm:');
    console.logResult(path, startTime);
    console.log(`Execution of A* algorithm took: ${endTime - beginTime}`);
}

function main() {
    task2('KRZYKI', 'Ramiszów', Criteria.t, new Date('2023-03-28T19:58:00'));
}

if (require.main === module) {
    main();
}