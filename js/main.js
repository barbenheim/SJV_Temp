let sharedData = [];
let geoData = null;

// Add this helper function to make the bars cleaner
function summarizeData(csvData, key) {
    const rolledUp = d3.rollups(csvData, 
        v => d3.sum(v, d => d.AREA), 
        d => d[key]
    );
  return rolledUp.map(([name, area]) => ({ [key]: name, AREA: area }));
}

Promise.all([
  d3.csv("data/SJV1885Table.csv"),
  d3.csv("data/SJV1945Table.csv"),
  d3.json("data/SJV_1885.geojson"),
  d3.json("data/SJV_1945.geojson")
]).then(([csv1885, csv1945, geo1885, geo1945]) => {
  
  // Process 1885 CSV data
  csv1885.forEach(d => {
    d.AREA = +d.AREA; // Convert AREA to number
    d.LU1885 = String(d.LU1885);
  });

  // Process 1945 CSV data
  csv1945.forEach(d => {
    d.AREA = +d.AREA; // Convert AREA to number
    d.LU1945 = String(d.LU1945);
  });

  geo1885.features.forEach(feature => {
    feature.properties.LU1885 = String(feature.properties.LU1885);
    // Process 1885 GeoJSON data
    const match = csv1885.find(d => d.LU1885 === feature.properties.LU1885);
    if (match) {
        feature.properties.AREA = match.AREA;
    }
  });

  // Process 1945 GeoJSON data
  geo1945.features.forEach(feature => {
    feature.properties.LU1945 = String(feature.properties.LU1945);
    const match = csv1945.find(d => d.LU1945 === feature.properties.LU1945);
    if (match) {
        feature.properties.AREA = match.AREA;
    }  
  });  // Close forEach
  sharedData = csv1885; // Default chart data
  geoData = geo1885;

  console.log("CSV loaded:", sharedData);
  console.log("GeoJSON loaded:", geoData);

  initMap(geo1885, geo1945, csv1885, csv1945);
  idKey = 'LU1885'; // Default idKey for chart
  const data1885 = summarizeData(csv1885, idKey);
  initChart(data1885);
}).catch(error => {
    console.error("Error loading data:", error);
});
