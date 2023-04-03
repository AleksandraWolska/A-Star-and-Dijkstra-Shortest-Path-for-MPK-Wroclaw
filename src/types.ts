type node = {
    name: string;
    lat: number;
    lon: number;
  };
  
  type edge = {
    start: string;
    stop: string;
    line: string;
    timeSinceTimeZero : (date: Date) => number;
    departureTime: Date;
    arrivalTime: Date;
     _timeSinceTimeZero: number | null;
    cost: number;
  };
  
  type line = {
    [node: string]: { [neighbour: string]: edge[] };
  };
  
  type graph = {
    lines: { [line: string]: { [node: string]: { [neighbour: string]: edge[] } } };
    nodes: { [node: string]: node };
  };
  
  export { node, edge, line, graph };