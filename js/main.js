window.app = {};
var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
var clickedCoordinate, populationLayer, gPopulation;
for (var z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

var baseLayer = new ol.layer.Tile({
  source: new ol.source.WMTS({
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    url: 'http://wmts.nlsc.gov.tw/wmts',
    layer: 'EMAP',
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true,
    attributions: '<a href="http://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
  }),
  opacity: 0.3
});

var sunStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 2
  }),
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 7, 0.5)'
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'point',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

function sunTextStyle(f) {
  var p = f.getProperties();
  var tStyle = sunStyle.clone();
  tStyle.getText().setText(p.zone);
  return tStyle;
}

var sunProj = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'geojson/zones.json',
    format: new ol.format.GeoJSON()
  }),
  style: sunTextStyle
});

var appView = new ol.View({
  center: ol.proj.fromLonLat([120.15079, 23.24766]),
  zoom: 14
});

var pointStyle = new ol.style.Style({
  image: new ol.style.RegularShape({
    radius: 15,
    points: 3,
    fill: new ol.style.Fill({
      color: '#AAAA33'
    }),
    stroke: new ol.style.Stroke({
      color: '#00f',
      width: 3
    })
  })
});

var vectorPoints = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'geojson/points.json',
    format: new ol.format.GeoJSON()
  }),
  style: pointStyle
});

var lineStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    width: 3,
    color: '#00f',
    lineDash: [.1, 5]
  }),
  text: new ol.style.Text({
    font: 'bold 16px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'point',
    fill: new ol.style.Fill({
      color: 'blue'
    })
  })
});

function lineTextStyle(f) {
  var p = f.getProperties();
  var tStyle = lineStyle.clone();
  tStyle.getText().setText(p.distance);
  return tStyle;
}

var lines = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'geojson/lines.json',
    format: new ol.format.GeoJSON()
  }),
  style: lineTextStyle
});

var map = new ol.Map({
  layers: [baseLayer, sunProj, vectorPoints, lines],
  target: 'map',
  view: appView
});
map.addControl(sidebar);

var content = document.getElementById('sidebarContent');
map.on('singleclick', function (evt) {
  content.innerHTML = '';
  clickedCoordinate = evt.coordinate;

  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var message = '';
    var p = feature.getProperties();
    for (k in p) {
      if (k !== 'geometry') {
        message += k + ': ' + p[k] + '<br />';
      }
    }

    content.innerHTML += message + '<hr />';
  });

  sidebar.open('home');
});