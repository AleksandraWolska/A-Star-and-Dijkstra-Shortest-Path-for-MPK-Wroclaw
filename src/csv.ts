import fs from 'fs';
import moment from 'moment';
import path from 'path';


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
function clearRow(row: string[]): any[] {
    let departureTime = row[indice_departure_time];
    let arrivalTime = row[indice_arrival_time];
    departureTime = `${(parseInt(departureTime?.slice(0, 2)) % 24)}${departureTime?.slice(2)}`;
    arrivalTime = `${(parseInt(arrivalTime?.slice(0, 2)) % 24)}${arrivalTime?.slice(2)}`;
    return [...row.slice(0, indice_departure_time), departureTime, arrivalTime, ...row.slice(indice_arrival_time + 1)];
}


export default function loadCSV(filename = 'data/connection_graph.csv') {
    const data = [];
    const filePath = path.join(__dirname, filename);
    const file = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const rows = file.split('\n');
    rows.splice(0, 1)
    for (const row of rows) {

        //console.log(row)
        const fields = clearRow(row.split(','));
        const entry = [
            parseInt(fields[indice_id]),
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

        //console.log(entry)
        data.push(entry);
    }
    return data;
}