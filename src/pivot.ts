import * as fs from 'fs';
import * as path from 'path';

interface DataRow {
  algorithm: string;
  heuristic: string;
  calculation_time: number;
  cost: number;
  ride_time: number;
  line_changes: number;
}

function parseCSV(filePath: string): DataRow[] {
    filePath = filePath + ".csv"
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

function calculateAverages(data: DataRow[]): Map<string, DataRow> {
  const resultMap = new Map<string, DataRow>();
  const countMap = new Map<string, number>();

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
    } else {
      resultMap.set(key, { ...row });
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

function writeCSV(outputPath: string, data: Map<string, DataRow>): void {
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
    lines.push(
      `${row.algorithm},${row.heuristic},${row.calculation_time},${row.cost},${row.ride_time},${row.line_changes}`,
    );
  }

  fs.writeFileSync(outputPath, lines.join('\n'));
}

export function pivotAverages(filename : string): void {
const outputFilename = filename + "_averages.csv"
  const inputPath = path.join(__dirname, filename);
  const outputPath = path.join(__dirname,outputFilename );
  const data = parseCSV(inputPath);
  const averages = calculateAverages(data);
  writeCSV(outputPath, averages);
}
