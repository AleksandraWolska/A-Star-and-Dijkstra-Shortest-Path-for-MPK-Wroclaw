const Criteria = {
    t: 0,
    p: 1
  };

  module.exports = {
    Criteria }


    function clearRow(row) {
        const badTime1 = row[indiceDepartureTime];
        const badTime2 = row[indiceArrivalTime];
        const modifiedTime1 = `${(parseInt(badTime1.slice(0, 2)) % 24)}${badTime1.slice(2)}`;
        const modifiedTime2 = `${(parseInt(badTime2.slice(0, 2)) % 24)}${badTime2.slice(2)}`;
        return [...row.slice(0, indiceDepartureTime), modifiedTime1, modifiedTime2, ...row.slice(indiceArrivalTime + 1)];
      }
      
      function loadCSV(filename = 'connection_graph.csv') {
        const data = [];
        const file = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = file.split('\n').slice(1);
        for (const row of rows) {
          const fields = clearRow(row.split(','));
          const entry = [      parseInt(fields[indiceId]),
            fields[indiceCompany],
            fields[indiceLine],
            moment(fields[indiceDepartureTime], 'HH:mm:ss').toDate(),
            moment(fields[indiceArrivalTime], 'HH:mm:ss').toDate(),
            fields[indiceStart],
            fields[indiceEnd],
            parseFloat(fields[indiceStartLat]),
            parseFloat(fields[indiceStartLon]),
            parseFloat(fields[indiceEndLat]),
            parseFloat(fields[indiceEndLon]),
          ];
          data.push(entry);
        }
        return data;
      }