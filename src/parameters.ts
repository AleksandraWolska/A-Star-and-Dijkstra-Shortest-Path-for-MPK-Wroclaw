const mode = {
    INTERACTIVE: "INTERACTIVE",
    ANALYZE: "ANALYZE"
}

const heuristicsOption = {
    TIME: "time",
    DISTANCE: "distance"
}

export const PROGRAM_MODE = mode.ANALYZE
export const HEURISTICS_MODE = heuristicsOption.DISTANCE

export const ANALYZE_RUNS = 10;

// export const ASTAR_TIME_POWER = 10;
// export const ASTAR_CHANGES_POWER = 1.5;
export const ASTAR_TIME_POWER = 10;
export const ASTAR_CHANGES_POWER = 0.4;

export const DEFAULT_START_NODE = "Prusa";
export const DEFAULT_END_NODE = "Kwiska";
export const DEFAULT_START_TIME = "17:00:00";

