"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const graph_1 = require("./graph");
const dijkstra_1 = require("./dijkstra");
const astar_1 = require("./astar");
const moment_1 = __importDefault(require("moment"));
const csv_1 = __importDefault(require("./csv"));
const distances_1 = require("./distances");
const readline_1 = __importDefault(require("readline"));
function createSummaryFile(graph, start, end, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const runs = 2;
        const headers = [
            'algorithm', 'calculation_time', 'cost', 'ride_time', 'line_changes',
        ];
        const results = [headers];
        for (let i = 0; i < runs; i++) {
            const algorithms = [
                { name: 'Dijkstra Algorithm', func: (g, s, e, t) => (0, dijkstra_1.dijkstra)(g, s, e, t) },
                { name: 'A* Algorithm - time - Manhattan', func: (g, s, e, t) => (0, astar_1.astar)(g, s, e, "t", distances_1.manhattan_distance) },
                { name: 'A* Algorithm - time - Euclidean', func: (g, s, e, t) => (0, astar_1.astar)(g, s, e, "t", distances_1.euclidean_distance) },
                { name: 'A* Algorithm - changes', func: (g, s, e, t) => (0, astar_1.astar)(g, s, e, "p", distances_1.manhattan_distance) },
            ];
            for (const { name, func } of algorithms) {
                const beginTime = new Date();
                const [cost, path] = yield func(graph, start, end, startTime);
                const arrivalTime = path[path.length - 1].arrivalTime;
                const endTime = new Date();
                const calculationTime = endTime.getTime() - beginTime.getTime();
                const lineChanges = (0, graph_1.getChangesAmount)(path);
                results.push([name, calculationTime.toString(), cost.toString(), ((arrivalTime.getTime() - startTime.getTime()) / 60000).toString(), lineChanges.toString()]);
            }
        }
        const csvContent = results.map(row => row.join(',')).join('\n');
        fs_1.default.writeFileSync('results.csv', csvContent);
    });
}
function getUserInput(promptText) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
function interactiveMode(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            console.log("Please provide the following details:");
            const startNode = yield getUserInput("Start stop (node) A: ");
            const destinationNode = yield getUserInput("Destination stop (node) B: ");
            const criteria = yield getUserInput("Criteria (t for time, p for line changes): ");
            const startTime = yield getUserInput("Start time (HH:mm:ss): ");
            const parsedStartTime = (0, moment_1.default)(startTime, 'HH:mm:ss').toDate();
            if (criteria === 't') {
                task1(graph, startNode, destinationNode, parsedStartTime);
                task2(graph, startNode, destinationNode, parsedStartTime);
            }
            else if (criteria === 'p') {
                task1(graph, startNode, destinationNode, parsedStartTime);
                task3(graph, startNode, destinationNode, parsedStartTime);
            }
            else {
                console.log("Invalid criteria. Please try again.");
            }
        }
    });
}
function printResults(algorithm, path, startTime, beginTime, endTime, cost) {
    console.log(`${algorithm}:`);
    console.log(path.map(edge => edge.toString()), startTime);
    console.log(`Execution of ${algorithm} took: ${endTime.getTime() - beginTime.getTime()}, line changed ${(0, graph_1.getChangesAmount)(path)} times and had cost of: ${cost}`);
}
function task1(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, dijkstra_1.dijkstra)(graph, start, end, startTime);
    const endTime = new Date();
    printResults('Dijkstra Algorithm', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}
function task2(graph, start, end, startTime) {
    const beginTime1 = new Date();
    const [cost1, path1] = (0, astar_1.astar)(graph, start, end, "t", distances_1.manhattan_distance);
    const endTime1 = new Date();
    printResults('A* Algorithm - time - Manhattan', path1, startTime.toLocaleDateString(), beginTime1, endTime1, cost1);
    const beginTime2 = new Date();
    const [cost2, path2] = (0, astar_1.astar)(graph, start, end, "t", distances_1.euclidean_distance);
    const endTime2 = new Date();
    printResults('A* Algorithm - time - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}
function task3(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, astar_1.astar)(graph, start, end, "p", distances_1.manhattan_distance);
    const endTime = new Date();
    printResults('A* Algorithm - changes', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (0, csv_1.default)();
        const datetime = (0, moment_1.default)('17:00:00', 'HH:mm:ss').toDate();
        const graph = new graph_1.Graph(data, datetime);
        console.log("main datetime:" + datetime);
        // task1(graph, 'Prusa', 'Kwiska', datetime);
        // task2(graph, 'Prusa', 'Kwiska', datetime);
        // task3(graph, 'Prusa', 'Kwiska', datetime);
        //await interactiveMode(graph);
        createSummaryFile(graph, "Prusa", "Kwiska", datetime);
    });
}
main();
//# sourceMappingURL=main.js.map