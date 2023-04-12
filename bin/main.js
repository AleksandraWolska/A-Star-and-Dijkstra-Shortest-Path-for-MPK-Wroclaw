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
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
const csv_1 = __importDefault(require("./csv"));
const readline_1 = __importDefault(require("readline"));
const graph_1 = require("./graph");
const dijkstra_1 = require("./dijkstra");
const astar_1 = require("./astar");
const distances_1 = require("./distances");
const parameters_1 = require("./parameters");
const pivot_1 = require("./pivot");
function createSummaryFile(graph, start, end, startTime, heuristicsOption, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = [
            'algorithm',
            'heuristic',
            'calculation_time',
            'cost',
            'ride_time',
            'line_changes',
        ];
        const results = [headers];
        const heuristics = heuristicsOption == "time" ?
            [
                { name: 'Time_Manhattan', func: distances_1.manhattanTimeHeuristic },
                { name: 'Time_Euclidean', func: distances_1.euclideanTimeHeuristic },
                { name: 'Time_Chebyshev', func: distances_1.chebyshevTimeHeuristic },
                { name: 'Time_Octile', func: distances_1.octileTimeHeuristic },
            ]
            :
                [
                    { name: 'Manhattan', func: distances_1.manhattanDistanceHeuristic },
                    { name: 'Euclidean', func: distances_1.euclideanDistanceHeuristic },
                    { name: 'Chebyshev', func: distances_1.chebyshevDistanceHeuristic },
                    { name: 'Octile', func: distances_1.octileDistanceHeuristic }
                ];
        for (let i = 0; i < parameters_1.ANALYZE_RUNS; i++) {
            const algorithms = [
                {
                    name: 'Dijkstra',
                    heuristic: '',
                    func: (g, s, e, t) => (0, dijkstra_1.dijkstra)(g, s, e, t),
                },
                ...heuristics.map((heuristic) => ({
                    name: 'A* time',
                    heuristic: heuristic.name,
                    func: (g, s, e, t) => (0, astar_1.astar)(g, s, e, 't', heuristic.func),
                })),
                ...heuristics.map((heuristic) => ({
                    name: 'A* changes',
                    heuristic: heuristic.name,
                    func: (g, s, e, t) => (0, astar_1.astar)(g, s, e, 'p', heuristic.func),
                })),
            ];
            for (const { name, heuristic, func } of algorithms) {
                const beginTime = new Date();
                const [cost, path] = yield func(graph, start, end, startTime);
                const endTime = new Date();
                const arrivalTime = path[path.length - 1].arrivalTime;
                const calculationTime = endTime.getTime() - beginTime.getTime();
                const lineChanges = (0, graph_1.getChangesAmount)(path);
                results.push([
                    name,
                    heuristic,
                    calculationTime.toString(),
                    cost.toString(),
                    ((arrivalTime.getTime() - startTime.getTime()) / 60000).toString(),
                    lineChanges.toString(),
                ]);
            }
        }
        const csvContent = results.map((row) => row.join(',')).join('\n');
        const outputFilename = filename + ".csv";
        const outputPath = path_1.default.join(__dirname, outputFilename);
        fs_1.default.writeFileSync(outputPath, csvContent);
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
            try {
                console.log("Please provide the following details:");
                let startNode = yield getUserInput("Start stop (node) A: ");
                startNode = startNode == "" ? parameters_1.DEFAULT_START_NODE : startNode;
                if (!Object.keys(graph.nodes).includes(startNode))
                    throw new Error("Start stop does not exist!");
                let destinationNode = yield getUserInput("Destination stop (node) B: ");
                destinationNode = destinationNode == "" ? parameters_1.DEFAULT_END_NODE : destinationNode;
                if (!Object.keys(graph.nodes).includes(destinationNode))
                    throw new Error("End stop does not exist!");
                let criteria = yield getUserInput("Criteria (t for time, p for line changes): ");
                criteria = criteria == "" ? "t" : criteria;
                let startTime = yield getUserInput("Start time (HH:mm:ss): ");
                startTime = startTime == "" ? parameters_1.DEFAULT_START_TIME : startTime;
                const parsedStartTime = (0, moment_1.default)(startTime, 'HH:mm:ss').toDate();
                if (criteria === 't') {
                    task1Dijkstra(graph, startNode, destinationNode, parsedStartTime);
                    task2AstarTime(graph, startNode, destinationNode, parsedStartTime);
                }
                else if (criteria === 'p') {
                    task1Dijkstra(graph, startNode, destinationNode, parsedStartTime);
                    task3AstarChanges(graph, startNode, destinationNode, parsedStartTime);
                }
                else {
                    console.log("Invalid criteria. Please try again.");
                }
            }
            catch (e) {
                console.error(e.message);
            }
        }
    });
}
function printResults(algorithm, path, startTime, beginTime, endTime, cost) {
    console.log(`${algorithm}:`);
    console.log(path.map(edge => edge.toString()), startTime);
    console.log(`${algorithm} | calculation time:  ${endTime.getTime() - beginTime.getTime()} | line changes: ${(0, graph_1.getChangesAmount)(path)} | cost: ${cost}`);
}
function task1Dijkstra(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, dijkstra_1.dijkstra)(graph, start, end, startTime);
    const endTime = new Date();
    printResults('Dijkstra Algorithm', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}
function task2AstarTime(graph, start, end, startTime) {
    const beginTime1 = new Date();
    const [cost1, path1] = (0, astar_1.astar)(graph, start, end, "t", distances_1.manhattanDistanceHeuristic);
    const endTime1 = new Date();
    printResults('A* Algorithm - time - Manhattan', path1, startTime.toLocaleDateString(), beginTime1, endTime1, cost1);
    const beginTime2 = new Date();
    const [cost2, path2] = (0, astar_1.astar)(graph, start, end, "t", distances_1.euclideanDistanceHeuristic);
    const endTime2 = new Date();
    printResults('A* Algorithm - time - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}
function task3AstarChanges(graph, start, end, startTime) {
    const beginTime = new Date();
    const [cost, path] = (0, astar_1.astar)(graph, start, end, "p", distances_1.manhattanDistanceHeuristic);
    const endTime = new Date();
    printResults('A* Algorithm - changes - Manhattan', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
    const beginTime2 = new Date();
    const [cost2, path2] = (0, astar_1.astar)(graph, start, end, "p", distances_1.euclideanDistanceHeuristic);
    const endTime2 = new Date();
    printResults('A* Algorithm - changes - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (0, csv_1.default)();
        const datetime = (0, moment_1.default)(parameters_1.DEFAULT_START_TIME, 'HH:mm:ss').toDate();
        const graph = new graph_1.Graph(data, datetime);
        if (parameters_1.PROGRAM_MODE == "INTERACTIVE") {
            yield interactiveMode(graph);
        }
        else {
            const filename = `results/report_${(new Date()).getTime().toString()}_hm_${parameters_1.HEURISTICS_MODE}_at_${parameters_1.ASTAR_TIME_POWER}_ac_${parameters_1.ASTAR_CHANGES_POWER}`;
            yield createSummaryFile(graph, parameters_1.DEFAULT_START_NODE, parameters_1.DEFAULT_END_NODE, datetime, parameters_1.HEURISTICS_MODE, filename);
            (0, pivot_1.pivotAverages)(filename);
        }
    });
}
main();
//# sourceMappingURL=main.js.map