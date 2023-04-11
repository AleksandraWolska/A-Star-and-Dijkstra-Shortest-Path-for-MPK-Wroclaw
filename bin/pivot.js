"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pivotAverages = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function parseCSV(filePath) {
    filePath = filePath + ".csv";
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    lines.shift(); // Remove headers
    return lines.map((line) => {
        const [algorithm, heuristic, calculation_time, cost, ride_time, line_changes] = line.split(',');
        return {
            algorithm,
            heuristic,
            calculation_time: parseFloat(calculation_time),
            cost: parseFloat(cost),
            ride_time: parseFloat(ride_time),
            line_changes: parseFloat(line_changes),
        };
    });
}
function calculateAverages(data) {
    const resultMap = new Map();
    const countMap = new Map();
    for (const row of data) {
        const key = `${row.algorithm}${row.heuristic ? ', ' + row.heuristic : ''}`;
        const currentCount = (countMap.get(key) || 0) + 1;
        countMap.set(key, currentCount);
        const currentRow = resultMap.get(key);
        if (currentRow) {
            currentRow.calculation_time += row.calculation_time;
            currentRow.cost += row.cost;
            currentRow.ride_time += row.ride_time;
            currentRow.line_changes += row.line_changes;
        }
        else {
            resultMap.set(key, Object.assign({}, row));
        }
    }
    for (const [key, row] of resultMap.entries()) {
        row.calculation_time /= countMap.get(key) || 1; //dla kazdej sumy podziel przez ilosc, lub 1 gdy 0
        row.cost /= countMap.get(key) || 1;
        row.ride_time /= countMap.get(key) || 1;
        row.line_changes /= countMap.get(key) || 1;
    }
    return resultMap;
}
function writeCSV(outputPath, data) {
    const headers = [
        'algorithm',
        'heuristic',
        'calculation_time',
        'cost',
        'ride_time',
        'line_changes',
    ];
    const lines = [headers.join(',')];
    for (const [key, row] of data.entries()) {
        lines.push(`${row.algorithm},${row.heuristic},${row.calculation_time},${row.cost},${row.ride_time},${row.line_changes}`);
    }
    fs.writeFileSync(outputPath, lines.join('\n'));
}
function pivotAverages(filename) {
    const outputFilename = filename + "_averages.csv";
    const inputPath = path.join(__dirname, filename);
    const outputPath = path.join(__dirname, outputFilename);
    const data = parseCSV(inputPath);
    const averages = calculateAverages(data);
    writeCSV(outputPath, averages);
}
exports.pivotAverages = pivotAverages;
//# sourceMappingURL=pivot.js.map