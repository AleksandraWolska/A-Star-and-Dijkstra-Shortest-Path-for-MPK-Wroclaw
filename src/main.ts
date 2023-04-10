import fs from 'fs';
import { Graph, getChangesAmount } from './graph';
import { dijkstra } from './dijkstra';
import { astar } from './astar';
import moment from 'moment';
import loadCSV from './csv';
import { euclidean_distance, manhattan_distance } from './distances';
import { graph, edge } from "./types"
import readline from 'readline';



async function createSummaryFile( graph: graph, start: string, end: string, startTime: Date): Promise<void> {
    const runs = 2;
    const headers = [
      'algorithm', 'calculation_time', 'cost', 'ride_time', 'line_changes',
    ];
    const results: string[][] = [headers];
  
    for (let i = 0; i < runs; i++) {
      const algorithms = [
        { name: 'Dijkstra Algorithm', func: (g: graph, s: string, e: string, t: Date) => dijkstra(g, s, e, t) },
        { name: 'A* Algorithm - time - Manhattan', func: (g: graph, s: string, e: string, t: Date) => astar(g, s, e, "t", manhattan_distance) },
        { name: 'A* Algorithm - time - Euclidean', func: (g: graph, s: string, e: string, t: Date) => astar(g, s, e, "t", euclidean_distance) },
        { name: 'A* Algorithm - changes', func: (g: graph, s: string, e: string, t: Date) => astar(g, s, e, "p", manhattan_distance) },
      ];
  
      for (const { name, func } of algorithms) {
        const beginTime = new Date();
        const [cost, path] = await func(graph, start, end, startTime);
        const arrivalTime = path[path.length-1].arrivalTime
        const endTime = new Date();
        const calculationTime = endTime.getTime() - beginTime.getTime();
        const lineChanges = getChangesAmount(path);
  
        results.push([name, calculationTime.toString(), cost.toString(), ((arrivalTime.getTime() - startTime.getTime())/60000).toString(), lineChanges.toString()]);
      }
    }
  
    const csvContent = results.map(row => row.join(',')).join('\n');
    fs.writeFileSync('results.csv', csvContent);
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
        console.log("Please provide the following details:");

        const startNode = await getUserInput("Start stop (node) A: ");
        const destinationNode = await getUserInput("Destination stop (node) B: ");
        const criteria = await getUserInput("Criteria (t for time, p for line changes): ");
        const startTime = await getUserInput("Start time (HH:mm:ss): ");

        const parsedStartTime = moment(startTime, 'HH:mm:ss').toDate();

        if (criteria === 't') {
            task1(graph, startNode, destinationNode, parsedStartTime);
            task2(graph, startNode, destinationNode, parsedStartTime);
        } else if (criteria === 'p') {
            task1(graph, startNode, destinationNode, parsedStartTime);
            task3(graph, startNode, destinationNode, parsedStartTime);
        } else {
            console.log("Invalid criteria. Please try again.");
        }
    }
}


function printResults(algorithm: string, path: edge[], startTime: string, beginTime: Date, endTime: Date, cost: number): void {
    console.log(`${algorithm}:`);
    console.log(path.map(edge => edge.toString()), startTime);
    console.log(`Execution of ${algorithm} took: ${endTime.getTime() - beginTime.getTime()}, line changed ${getChangesAmount(path)} times and had cost of: ${cost}`);
}



function task1(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime = new Date();
    const [cost, path] = dijkstra(graph, start, end, startTime);
    const endTime = new Date();
    printResults('Dijkstra Algorithm', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}

function task2(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime1 = new Date();
    const [cost1, path1] = astar(graph, start, end, "t", manhattan_distance);
    const endTime1 = new Date();
    printResults('A* Algorithm - time - Manhattan', path1, startTime.toLocaleDateString(), beginTime1, endTime1, cost1);

    const beginTime2 = new Date();
    const [cost2, path2] = astar(graph, start, end, "t", euclidean_distance);
    const endTime2 = new Date();
    printResults('A* Algorithm - time - Euclidean', path2, startTime.toLocaleDateString(), beginTime2, endTime2, cost2);
}

function task3(graph: graph, start: string, end: string, startTime: Date): void {
    const beginTime = new Date();
    const [cost, path] = astar(graph, start, end, "p", manhattan_distance);
    const endTime = new Date();
    printResults('A* Algorithm - changes', path, startTime.toLocaleDateString(), beginTime, endTime, cost);
}

async function main(): Promise<void> {
    const data = loadCSV();
    const datetime = moment('17:00:00', 'HH:mm:ss').toDate();
    const graph: graph = new Graph(data, datetime);
    console.log("main datetime:" + datetime);
    // task1(graph, 'Prusa', 'Kwiska', datetime);
    // task2(graph, 'Prusa', 'Kwiska', datetime);
    // task3(graph, 'Prusa', 'Kwiska', datetime);
    //await interactiveMode(graph);

    createSummaryFile(graph, "Prusa", "Kwiska", datetime)
    }
    
    main();