let map;
let layer1885;
let layer1945;

function initMap(geoData1885, geoData1945, csv1885, csv1945) {
  map = L.map("map", {
    zoomControl: false // Disable default zoom location
  }).setView([36.0947471, -119.783793], 9);

  // Add it back to the bottom left
  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Create the 1885 Layer (On by default)
  layer1885 = L.geoJSON(geoData1885, {
    style: function(feature) {
      // Safety check for properties and LU1885 before accessing them
      // Safety check: only look for properties if feature exists
    const type = (feature && feature.properties) ? feature.properties.LU1885 : null;
      return { fillColor: getColor(type), weight: 0, fillOpacity: 0.7, color: 'false' };
    },
    onEachFeature: onEachFeature
  });

  // Create the 1945 Layer (Off by default)
  layer1945 = L.geoJSON(geoData1945, {
    style: function(feature) {
    const type = (feature && feature.properties) ? feature.properties.LU1945 : null; 
    // We explicitly use the 1945 property here
    const cat = feature.properties.LU1945; 
    return { fillColor: getColor(type), weight: 0, fillOpacity: 0.7, color: 'false' };
    },
    onEachFeature: onEachFeature
  });

  // Add the default layer to start
  layer1885.addTo(map);

  // Create the Toggle (Change Detection)
  const changeDetection = {
    "1885": layer1885,
    "1945": layer1945
  };

  // Add the layer control to the map
  L.control.layers(changeDetection, null, { collapsed: false }).addTo(map);

  //map.fitBounds(geoLayer.getBounds());
  map.on('baselayerchange', function(event) {
    if (event.name === "1945") {
      // Remove 1885 layer when 1945 is selected
      if (map.hasLayer(layer1885)) { map.removeLayer(layer1885); }

      // Summarize the 1945 data and update the chart with the new summarized data and key
      const data1945 = summarizeData(csv1945, "LU1945");
      updateChart(data1945, "LU1945"); // Adds "LU1945" as a second argument
    } else {
      // Remove 1945 layer when 1885 is selected
      if (map.hasLayer(layer1945)) { map.removeLayer(layer1945); }

      // Summarize the 1885 data and update the chart with the new summarized data and key
      const data1885 = summarizeData(csv1885, "LU1885");
      updateChart(data1885, "LU1885"); // Adds "LU1885" as a second argument
    }
  });

  const legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = ['Grassland', 'Saltbush', 'Wetlands', 'Riparian', 'Valley oak', 'Water', 'Irrigated', 'Urban'];
      
    div.innerHTML += '<strong>Vegetation</strong><br>';

    // Loop through categories and generate a label with a colored square for each
    for (let i = 0; i < categories.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(categories[i]) + '"></i> ' +
        categories[i] + '<br>';
      }

      return div;
  };

  legend.addTo(map);

}

function getColor(type) {
  switch (type) {
    case 'Grassland': return '#F7E5D2'; // Light Beige
    case 'Saltbush':  return '#EBAF26'; // Orange/Brown
    case 'Wetlands':  return '#8DD9F2'; // Light Blue
    case 'Riparian':  return '#7A674B'; // Dark Brown
    case 'Valley oak': return '#BDA077'; // Brown
    case 'Water':      return '#30A5DB'; // Blue
    case 'Irrigated':  return '#299434'; // Green
    case 'Urban':      return '#F24447'; // Red
    default:           return '#413e3e'; // Gray for unknown
  }
}

function onEachFeature(feature, layer) {
  layer.on({
    // Desktop: Highlight when the mouse enters the polygon
    mouseover: (e) => {
        const activeKey = map.hasLayer(layer1945) ? 'LU1945' : 'LU1885';
        const activeValue = feature.properties[activeKey];
        highlightMap(activeValue);
        highlightChart(activeValue);
    },
    // Desktop: Reset when the mouse leaves the polygon
    mouseout: () => {
        resetMap();
        resetChart();
    },
    // Click for Mobile: Highlight on click and stop propagation to prevent map panning
    click: (e) => {
        L.DomEvent.stopPropagation(e);
        const activeKey = map.hasLayer(layer1945) ? 'LU1945' : 'LU1885';
        const activeValue = feature.properties[activeKey];
        highlightMap(activeValue);
        highlightChart(activeValue);
    }
  });
}

function highlightMap(id) {
  const activeLayerGroup = map.hasLayer(layer1945) ? layer1945 : layer1885;
  const activeKey = map.hasLayer(layer1945) ? 'LU1945' : 'LU1885';

  activeLayerGroup.eachLayer(layer => {
  const isMatch = String(layer.feature.properties[activeKey]) === String(id);

    if (isMatch) {
      layer.setStyle({
        stroke: true,
        weight: 2,
        color: "black",
        fillOpacity: 0.9
      });
      layer.bringToFront();
      } else {
        layer.setStyle({
        stroke: false,
        fillOpacity: 0.2
      });
    }
  });
}


function resetMap() {
  [layer1885, layer1945].forEach(lg => {
    lg.eachLayer(layer => {
      layer.setStyle({
        stroke: false, // Ensure no borders appear on reset
        fillOpacity: 0.7
      });
    });
  });
}


