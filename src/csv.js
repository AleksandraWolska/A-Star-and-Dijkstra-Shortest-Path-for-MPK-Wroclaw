"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
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
exports.default = loadCSV;
//# sourceMappingURL=csv.js.map