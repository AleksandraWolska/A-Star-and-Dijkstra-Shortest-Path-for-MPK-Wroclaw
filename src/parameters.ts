const mode = {
    INTERACTIVE: "INTERACTIVE",
    ANALYZE: "ANALYZE"
}

const heuristicsOption = {
    TIME: "time",
    DISTANCE: "distance"
}

export const PROGRAM_MODE = mode.INTERACTIVE
export const HEURISTICS_MODE = heuristicsOption.DISTANCE

export const ANALYZE_RUNS = 10;

// export const ASTAR_TIME_POWER = 40;
// export const ASTAR_CHANGES_POWER = 5;
export const ASTAR_TIME_POWER = 10;
export const ASTAR_CHANGES_POWER = 1.5;

export const DEFAULT_START_NODE = "KRZYKI";
export const DEFAULT_END_NODE = "Mosty Warszawskie";
export const DEFAULT_START_TIME = "17:00:00";


