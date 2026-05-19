let svg;
let idKey; // Declare idKey in a scope accessible to all functions
const tooltip = d3.select("body").append("div").attr("class", "tooltip"); // Indicates which css file to use for the tooltip

// Here we will reference our CSV variable names.
function initChart(data) {

  // idKey = data[0].LU1885 ? 'LU1885' : 'LU1945'; // Finds column for land use type
  const width = 400;
  const height = 300;
  const margin = {top: 20, right: 10, bottom: 20, left: 10}; // Add padding

  svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(data.map(d => d[idKey]))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AREA)])
    .range([height - margin.bottom, margin.top]);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d[idKey]))
    .attr("y", d => y(d.AREA))
    .attr("width", x.bandwidth())
    .attr("height", d => (height - margin.bottom) - y(+d.AREA))
    .attr("fill", d => getColor(d[idKey]))
    .on("mouseover", (event, d) => {
      highlightChart(d[idKey]);
      highlightMap(d[idKey]); // link to map

      // TOOLTIP LOGIC
      tooltip.style("opacity", 1)
      .html(`<strong>Type:</strong> ${d[idKey]}<br><strong>Area:</strong> ${d.AREA.toLocaleString()} <strong>sq. meters</strong>`);
    })
    .on("mousemove", (event) => {
      // Positions the tooltip next to the cursor
      tooltip.style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
     })
    .on("mouseout", () => {
      resetChart();
      resetMap();
      tooltip.style("opacity", 0); // Hides tooltip
    });
}

// Highlight chart bars
function highlightChart(type) {
  svg.selectAll("rect")
    .attr("opacity", d => d[idKey] === type ? 1 : 0.3)
    .attr("stroke", d => d[idKey] === type ? "black" : "none")
    .attr("stroke-width", d => d[idKey] === type ? "2px" : "0");
}

// Update chart with new data and force idKey to change
function updateChart(newData, key) {
    // Clear existing SVG elements
    idKey = key; // Explicitly set idKey to the key layer year we passed in
    d3.select("#chart").html("");
    initChart(newData); 
}

// Reset chart
function resetChart() {
  if (svg) {
    svg.selectAll("rect")
    .attr("opacity", 1);
  }
}