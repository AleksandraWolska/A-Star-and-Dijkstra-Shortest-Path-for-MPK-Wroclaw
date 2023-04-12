import fs from 'fs';
import path from 'path';
import moment from 'moment';
import loadCSV from './csv'
import readline from 'readline';

import { Graph, getChangesAmount } from './graph';
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import {
    manhattanDistanceHeuristic,
    euclideanDistanceHeuristic,
    chebyshevDistanceHeuristic,
    octileDistanceHeuristic,
    manhattanTimeHeuristic,
    euclideanTimeHeuristic,
    chebyshevTimeHeuristic,
    octileTimeHeuristic,
} from './distances';
import { graph, edge } from "./types"
import { ANALYZE_RUNS, ASTAR_CHANGES_POWER, ASTAR_TIME_POWER, DEFAULT_END_NODE, DEFAULT_START_NODE, DEFAULT_START_TIME, HEURISTICS_MODE, PROGRAM_MODE } from './parameters';
import { pivotAverages } from './pivot';


async function createSummaryFile(graph: graph, start: string, end: string, startTime: Date, heuristicsOption: string, filename: string): Promise<void> {
    const headers = [
        'algorithm',
        'heuristic',
        'calculation_time',
        'cost',
        'ride_time',
        'line_changes',
    ];
    const results: string[][] = [headers];

    const heuristics = heuristicsOption == "time" ?
        [
            { name: 'Time_Manhattan', func: manhattanTimeHeuristic },
            { name: 'Time_Euclidean', func: euclideanTimeHeuristic },
            { name: 'Time_Chebyshev', func: chebyshevTimeHeuristic },
            { name: 'Time_Octile', func: octileTimeHeuristic },
        ]
        :
        [
            { name: 'Manhattan', func: manhattanDistanceHeuristic },
            { name: 'Euclidean', func: euclideanDistanceHeuristic },
            { name: 'Chebyshev', func: chebyshevDistanceHeuristic },
            { name: 'Octile', func: octileDistanceHeuristic }
        ]


    for (let i = 0; i < ANALYZE_RUNS; i++) {
        const algorithms = [
            {
                name: 'Dijkstra',
                heuristic: '',
                func: (g: graph, s: string, e: string, t: Date) => dijkstra(g, s, e, t),
            },
            ...heuristics.map((heuristic) => ({
                name: 'A* time',
                heuristic: heuristic.name,
                func: (g: graph, s: string, e: string, t: Date) =>
                    astar(g, s, e, 't', heuristic.func),
            })),
            ...heuristics.map((heuristic) => ({
                name: 'A* changes',
                heuristic: heuristic.name,
                func: (g: graph, s: string, e: string, t: Date) =>
                    astar(g, s, e, 'p', heuristic.func),
            })),
        ];

        for (const { name, heuristic, func } of algorithms) {
            const beginTime = new Date();
            const [cost, path] = await func(graph, start, end, startTime);
            const endTime = new Date();
            const arrivalTime = path[path.length - 1].arrivalTime;
            const calculationTime = endTime.getTime() - beginTime.getTime();
            const lineChanges = getChangesAmount(path);

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
    const outputFilename = filename + ".csv"
    const outputPath = path.join(__dirname, outputFilename);
    fs.writeFileSync(outputPath, csvContent);
}


function getUserInput(promptText: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer as string);
        });
    });
}

async function interactiveMode(graph: graph): Promise<void> {
    while (true) {
        try {
            console.log("Please provide the following details:");

            let startNode = await getUserInput("Start stop (node) A: ");
            startNode = startNode == "" ? DEFAULT_START_NODE : startNode
            if (!Object.keys(graph.nodes).includes(startNode)) throw new Error("Start stop does not exist!")

            let destinationNode = await getUserInput("Destination stop (node) B: ");
            destinationNode = destinationNode == "" ? DEFAULT_END_NODE : destinationNode
            if (!Object.keys(graph.nodes).includes(destinationNode)) throw new Error("End stop does not exist!")

            let criteria = await getUserInput("Criteria (t for time, p for line changes): ");
            criteria = criteria == "" ? "t" : criteria
            
            let startTime = await getUserInput("Start time (HH:mm:ss): ");
            startTime = startTime == "" ? DEFAULT_START_TIME : startTime
            const parsedStartTime = moment(startTime, 'HH:mm:ss').toDate();


            if (criteria === 't') {
                task1Dijkstra(graph, startNode, destinationNode, parsedStartTime);
                task2AstarTime(graph, startNode, destinationNode, parsedStartTime);
            } else if (criteria === 'p') {
                task1Dijkstra(graph, startNode, destinationNode, parsedStartTime);
                task3AstarChanges(graph, startNode, destinationNode, parsedStartTime);
            } else {
                console.log("Invalid criteria. Please try again.");
            }

        } catch (e) {
            console.error(e.message)
        }

    }
}


function printResults(algorithm: string, path: edge[], startTime: string, beginTime: Date, endTime: Date, cost: number): void {
    console.log(`${algorithm}:`);
    console.log(path.map(edge => edge.toString()), startTime);
    console.log(`${algorithm} | calculation time:  ${endTime.getTime() - beginTime.getTime()} | line changes: ${getChangesAmount(path)} | cost: ${cost}`);
}


function task1Dijkstra(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime = new Date();
    const [cost, path] = dijkstra(graph, start, end, startTime);
    const endTime = new Date();
    printResults('Dijkstra Algorithm', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}

function task2AstarTime(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime1 = new Date();
    const [cost1, path1] = astar(graph, start, end, "t", manhattanDistanceHeuristic);
    const endTime1 = new Date();
    printResults('A* Algorithm - time - Manhattan', path1, startTime.toLocaleDateString(), beginTime1, endTime1, cost1);

    const beginTime2 = new Date();
    const [cost2, path2] = astar(graph, start, end, "t", euclideanDistanceHeuristic);
    const endTime2 = new Date();
    printResults('A* Algorithm - time - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}

function task3AstarChanges(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime = new Date();
    const [cost, path] = astar(graph, start, end, "p", manhattanDistanceHeuristic);
    const endTime = new Date();
    printResults('A* Algorithm - changes - Manhattan', path, startTime.toLocaleDateString(), beginTime, endTime, cost);

    const beginTime2 = new Date();
    const [cost2, path2] = astar(graph, start, end, "p", euclideanDistanceHeuristic);
    const endTime2 = new Date();
    printResults('A* Algorithm - changes - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}


async function main(): Promise<void> {
    const data = loadCSV();
    const datetime = moment(DEFAULT_START_TIME, 'HH:mm:ss').toDate();
    const graph: graph = new Graph(data, datetime);

    if (PROGRAM_MODE == "INTERACTIVE") {
        await interactiveMode(graph);
    } else {
        const filename = `results/report_${(new Date()).getTime().toString()}_hm_${HEURISTICS_MODE}_at_${ASTAR_TIME_POWER}_ac_${ASTAR_CHANGES_POWER}`
        await createSummaryFile(graph, DEFAULT_START_NODE, DEFAULT_END_NODE, datetime, HEURISTICS_MODE, filename)
        pivotAverages(filename)
    }
}

main();