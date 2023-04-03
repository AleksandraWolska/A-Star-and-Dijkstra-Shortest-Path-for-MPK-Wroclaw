type node = {
  name: string;
  latitude: number;
  longitude: number;
};

type edge = {
  start: string;
  stop: string;
  line: string;
  setTimeFromMomentZero: (date: Date) => number;
  departureTime: Date;
  arrivalTime: Date;
  timeFromMomentZero: number | null;
  rideCost: number;
};

type line = {
  [node: string]: { [neighbour: string]: edge[] };
};

type graph = {
  lines: { [line: string]: { [node: string]: { [neighbour: string]: edge[] } } };
  nodes: { [node: string]: node };
};
export type costDict = { [key: string]: number }
export type pathDict = { [key: string]: edge }

export { node, edge, line, graph };