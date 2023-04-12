import fs from 'fs';
import moment from 'moment';
import path from 'path';

const idx_id = 0;
const idx_company = 2;
const idx_line = 3;
const idx_departure_time = 4;
const idx_arrival_time = 5;
const idx_start = 6;
const idx_end = 7;
const idx_start_lat = 8;
const idx_start_lon = 9;
const idx_end_lat = 10;
const idx_end_lon = 11;

function clearRow(row: string[]): any[] {
    let departureTime = row[idx_departure_time];
    let arrivalTime = row[idx_arrival_time];
    departureTime = `${(parseInt(departureTime?.slice(0, 2)) % 24)}${departureTime?.slice(2)}`;
    arrivalTime = `${(parseInt(arrivalTime?.slice(0, 2)) % 24)}${arrivalTime?.slice(2)}`;
    return [...row.slice(0, idx_departure_time), departureTime, arrivalTime, ...row.slice(idx_arrival_time + 1)];
}

export default function loadCSV(filename = 'data/connection_graph.csv') {
    const data = [];
    const filePath = path.join(__dirname, filename);
    const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const rows = file.split('\n');
    rows.splice(0, 1)
    for (const row of rows) {
        const fields = clearRow(row.split(','));
        const entry = [
            parseInt(fields[idx_id]),
            fields[idx_company],
            fields[idx_line],
            moment(fields[idx_departure_time], 'HH:mm:ss').toDate(),
            moment(fields[idx_arrival_time], 'HH:mm:ss').toDate(),
            fields[idx_start],
            fields[idx_end],
            parseFloat(fields[idx_start_lat]),
            parseFloat(fields[idx_start_lon]),
            parseFloat(fields[idx_end_lat]),
            parseFloat(fields[idx_end_lon]),

        ];
        data.push(entry);
    }
    return data;
}