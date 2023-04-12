"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
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
function clearRow(row) {
    let departureTime = row[idx_departure_time];
    let arrivalTime = row[idx_arrival_time];
    departureTime = `${(parseInt(departureTime === null || departureTime === void 0 ? void 0 : departureTime.slice(0, 2)) % 24)}${departureTime === null || departureTime === void 0 ? void 0 : departureTime.slice(2)}`;
    arrivalTime = `${(parseInt(arrivalTime === null || arrivalTime === void 0 ? void 0 : arrivalTime.slice(0, 2)) % 24)}${arrivalTime === null || arrivalTime === void 0 ? void 0 : arrivalTime.slice(2)}`;
    return [...row.slice(0, idx_departure_time), departureTime, arrivalTime, ...row.slice(idx_arrival_time + 1)];
}
function loadCSV(filename = 'data/connection_graph.csv') {
    const data = [];
    const filePath = path_1.default.join(__dirname, filename);
    const file = fs_1.default.readFileSync(filePath, { encoding: 'utf-8' });
    const rows = file.split('\n');
    rows.splice(0, 1);
    for (const row of rows) {
        const fields = clearRow(row.split(','));
        const entry = [
            parseInt(fields[idx_id]),
            fields[idx_company],
            fields[idx_line],
            (0, moment_1.default)(fields[idx_departure_time], 'HH:mm:ss').toDate(),
            (0, moment_1.default)(fields[idx_arrival_time], 'HH:mm:ss').toDate(),
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
exports.default = loadCSV;
//# sourceMappingURL=csv.js.map