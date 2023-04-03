"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const graph_1 = require("./graph");
const dijkstra_1 = require("./dijkstra");
const astar_1 = require("./astar");
const moment_1 = __importDefault(require("moment"));
const distances_1 = require("./distances");
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
function clearRow(row) {
    let departureTime = row[indice_departure_time];
    let arrivalTime = row[indice_arrival_time];
    departureTime = `${(parseInt(departureTime === null || departureTime === void 0 ? void 0 : departureTime.slice(0, 2)) % 24)}${departureTime === null || departureTime === void 0 ? void 0 : departureTime.slice(2)}`;
    arrivalTime = `${(parseInt(arrivalTime === null || arrivalTime === void 0 ? void 0 : arrivalTime.slice(0, 2)) % 24)}${arrivalTime === null || arrivalTime === void 0 ? void 0 : arrivalTime.slice(2)}`;
    // const timeString = '19:58:00'; // example time in hh:mm:ss format
    // const [hours, minutes, seconds] = timeString.split(':').map(Number);
    // const today = new Date();
    // const datetime = new Date();
    // datetime.setHours(hours);
    // datetime.setMinutes(minutes);
    // datetime.setSeconds(seconds);
    // console.log(datetime)
    //console.log();
    //console.log(departureTime)
    return [...row.slice(0, indice_departure_time), departureTime, arrivalTime, ...row.slice(indice_arrival_time + 1)];
}
function loadCSV(filename = 'connection_graph.csv') {
    const data = [];
    const file = fs_1.default.readFileSync(filename, { encoding: 'utf-8' });
    const rows = file.split('\n');
    rows.splice(0, 1);
    for (const row of rows) {
        //console.log(row)
        const fields = clearRow(row.split(','));
        const entry = [
            parseInt(fields[indice_id]),
            fields[indice_company],
            fields[indice_line],
            (0, moment_1.default)(fields[indice_departure_time], 'HH:mm:ss').toDate(),
            (0, moment_1.default)(fields[indice_arrival_time], 'HH:mm:ss').toDate(),
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
function task1(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, dijkstra_1.dijkstra)(graph, start, end, startTime);
    const endTime = new Date();
    console.log('Dijkstra Algorithm:');
    console.log(path.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of Dijkstra algorithm took: ${endTime.getTime() - beginTime.getTime()}, line changed ${(0, graph_1.getChangesAmount)(path)} times and had cost of: ${cost}`);
}
function task2(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, astar_1.astar)(graph, start, end, startTime, "t", distances_1.manhattan_distance);
    const endTime = new Date();
    console.log('A* Algorithm - time:');
    console.log(path.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of A* algorithm took: ${endTime.getTime() - beginTime.getTime()}, line changed ${(0, graph_1.getChangesAmount)(path)} times and had cost of: ${cost}`);
}
function task3(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, astar_1.astar)(graph, start, end, startTime, "p", distances_1.manhattan_distance);
    const endTime = new Date();
    console.log('A* Algorithm - changes:');
    console.log(path.map(edge => edge.toString()), startTime.toLocaleDateString());
    console.log(`Execution of A* algorithm took: ${endTime.getTime() - beginTime.getTime()}, line changed ${(0, graph_1.getChangesAmount)(path)} times and had cost of: ${cost}`);
}
function main() {
    const data = loadCSV();
    let datetime = (0, moment_1.default)('17:00:00', 'HH:mm:ss').toDate();
    let graph = new graph_1.Graph(data, datetime);
    // const timeString = '19:58:00'; // example time in hh:mm:ss format
    // const [hours, minutes, seconds] = timeString.split(':').map(Number);
    // const today = new Date();
    // const datetime = new Date();
    // datetime.setHours(hours);
    // datetime.setMinutes(minutes);
    // datetime.setSeconds(seconds);
    // console.log(datetime)
    console.log("main datetime:" + datetime);
    task1(graph, 'Prusa', 'Kwiska', datetime);
    let graph2 = new graph_1.Graph(data, datetime);
    task2(graph2, 'Prusa', 'Kwiska', datetime);
    let graph3 = new graph_1.Graph(data, datetime);
    task3(graph3, 'Prusa', 'Kwiska', datetime);
}
main();
//# sourceMappingURL=main.js.map