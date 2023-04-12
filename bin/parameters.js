"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_START_TIME = exports.DEFAULT_END_NODE = exports.DEFAULT_START_NODE = exports.ASTAR_CHANGES_POWER = exports.ASTAR_TIME_POWER = exports.ANALYZE_RUNS = exports.HEURISTICS_MODE = exports.PROGRAM_MODE = void 0;
const mode = {
    INTERACTIVE: "INTERACTIVE",
    ANALYZE: "ANALYZE"
};
const heuristicsOption = {
    TIME: "time",
    DISTANCE: "distance"
};
exports.PROGRAM_MODE = mode.ANALYZE;
exports.HEURISTICS_MODE = heuristicsOption.DISTANCE;
exports.ANALYZE_RUNS = 10;
// export const ASTAR_TIME_POWER = 40;
// export const ASTAR_CHANGES_POWER = 5;
exports.ASTAR_TIME_POWER = 10;
exports.ASTAR_CHANGES_POWER = 1.5;
exports.DEFAULT_START_NODE = "KRZYKI";
exports.DEFAULT_END_NODE = "Mosty Warszawskie";
exports.DEFAULT_START_TIME = "17:00:00";
//# sourceMappingURL=parameters.js.map