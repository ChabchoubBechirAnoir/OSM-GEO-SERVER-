//URL Geoserver
var url_geoserver = "http://127.0.0.1:6565/geoserver/wms";
//url des couches
var access_layer_adm1 = "formation_gs:tun_gouvernorats_utm";
//déclaration des couches openlayers
var lyr_adm1 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: url_geoserver,
        params: { LAYERS: access_layer_adm1, TILED: "true" },
    }),
    title: "Gouvernorats",
});
var access_layer_adm5 = "formation_gs:roads_utm";
//déclaration des couches openlayers
var lyr_adm5 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: url_geoserver,
        params: { LAYERS: access_layer_adm5, TILED: "true" },
    }),
    title: "Roads",
});
var access_layer_adm3 = "formation_gs:clients_utm";
//déclaration des couches openlayers
var lyr_adm3 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: url_geoserver,
        params: { LAYERS: access_layer_adm3, TILED: "true" },
    }),
    title: "Clients",
});
var access_layer_adm4 = "formation_gs:pdv_rtm";
//déclaration des couches openlayers
var lyr_adm4 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: url_geoserver,
        params: { LAYERS: access_layer_adm4, TILED: "true" },
    }),
    title: "PDV",
});
lyr_adm1.setVisible(true);
var lyr_adm2 =  new ol.layer.Tile({
    source: new ol.source.OSM()
});
lyr_adm2.setVisible(true);
lyr_adm1.setVisible(true)
lyr_adm3.setVisible(true);
lyr_adm4.setVisible(true);
lyr_adm5.setVisible(true);


var layersList = [lyr_adm2,lyr_adm1,lyr_adm3,lyr_adm4,lyr_adm5];
//Definition des popups pour affichage des infos
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};
function parseResponse(data) {
    var poifound = 0;
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(data)
    });
    console.log((new ol.format.GeoJSON()).readFeatures(data));
    var features = vectorSource.getFeatures();
    var str=clicked_coord;
    for(x in features) {
        var id = features[x].getId();
        var props = features[x].getProperties();
        if((id.indexOf("clients")>-1) && (poifound==0))
        { str = str + '<br/>' + props["CATEGORIE"] + '<br/>' + props["CA"];
            poifound=1;
        }
        if(id.indexOf("gouvernorats")>-1)
        { str = str + '<br/>' + props["NOMG"];
            // poifound=1;
            break;
        }
    }
    if(str) {
        var str1 = "<meta http-equiv="+"'Content-Type'"+"content="+"'text/html;charset=UTF-8'"+" />"
        str = '<p>' + str + '</p>';
        overlayPopup.setPosition(clicked_coord);
        content.innerHTML = str; //JSON.stringify(
        container.style.display = 'block';
        clicked_pois = 1;
    }
    else{
        container.style.display = 'none';
        closer.blur();
        clicked_pois = 0;
    }
}
var clicked_coord;
var onSingleClick = function(evt) {
    var coord = evt.coordinate;
    console.log(coord);
    var str = coord;
    var source1 = lyr_adm2;
    var source2 = access_layer_adm1;
    var layers_list = source2 + ',' + source1;
    var view = map.getView();
    var viewResolution = view.getResolution();
    url=lyr_adm1.getSource().getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, view.getProjection(),
        { 'INFO_FORMAT': 'text/javascript',
            'FEATURE_COUNT': 20,
            'LAYERS': layers_list,
            'QUERY_LAYERS': layers_list
        });
    console.log(url);
    if (url) { //call parseResponse(data)
        clicked_coord = coord;
        $.ajax(url,
            {dataType: 'jsonp'}
        ).done(function (data) {
        });
    }
    if(str) {
    str = '<p>' + str + '</p>';
    overlayPopup.setPosition(coord);
    content.innerHTML = str;
    container.style.display = 'block';
    }
    else{
    container.style.display = 'none';
    closer.blur();
    }
}
var overlayPopup = new ol.Overlay({
    element: container
});
var map = new ol.Map({
    controls: ol.control.defaults().extend([
        new ol.control.LayerSwitcher({ tipLabel: "Layers" }),
        new ol.control.ScaleLine(),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: "EPSG:4326",
        }),
    ]),
    target: "map",
    layers: layersList,
    view: new ol.View({
        projection: "EPSG:3857",
        center: [9.37884, 34.240721],
        zoom: 7,
    }),
    overlays: [overlayPopup]
});
map.on('pointermove', function(event) {
    var coord3857 = event.coordinate;
    var coord4326 = ol.proj.transform(coord3857, 'EPSG:3857', 'EPSG:4326');
    $('#mouse3857').text(ol.coordinate.toStringXY(coord3857, 2));
    $('#mouse4326').text(ol.coordinate.toStringXY(coord4326, 5));
});
map.on('singleclick', function(evt) {
    onSingleClick(evt);
});


// Define Geometries
var point = new ol.geom.Point(
    ol.proj.transform([9.378840, 34.240721], 'EPSG:4326', 'EPSG:3857')
);
var circle = new ol.geom.Circle(
    ol.proj.transform([9.378840, 34.240721], 'EPSG:4326', 'EPSG:3857'),
    600000
);
// Features
var pointFeature = new ol.Feature(point);
var circleFeature = new ol.Feature(circle);
// Source
var vectorSource = new ol.source.Vector({
    projection: 'EPSG:4326'
});
vectorSource.addFeatures([pointFeature, circleFeature]);
// vector layer
var vectorLayer = new ol.layer.Vector({
    source: vectorSource
});
//add layer to the map
map.addLayer(vectorLayer);

var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 100, 50, 0.3)'
    }),
    stroke: new ol.style.Stroke({
        width: 2,
        color: 'rgba(255, 100, 50, 0.8)'
    }),
    image: new ol.style.Circle({
        fill: new ol.style.Fill({
            color: 'rgba(55, 200, 150, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            width: 1,
            color: 'rgba(55, 200, 150, 0.8)'
        }),
        radius: 7
    }),
});
// vector layer with the style
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: style
});

var button = $('#pan').button('toggle');
var interaction;
$('div.btn-group button').on('click', function(event) {
    var id = event.target.id;
    // Toggle buttons
    button.button('toggle');
    button = $('#'+id).button('toggle');
    // Remove previous interaction
    map.removeInteraction(interaction);
    // Update active interaction
    switch(event.target.id) {
        case "select":
            interaction = new ol.interaction.Select();
            map.addInteraction(interaction);
            break;
        case "point":
            interaction = new ol.interaction.Draw({
                type: 'Point',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "line":
            interaction = new ol.interaction.Draw({
                type: 'LineString',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "polygon":
            interaction = new ol.interaction.Draw({
                type: 'Polygon',
                source: vectorLayer.getSource()
            });
            map.addInteraction(interaction);
            break;
        case "modify":
            interaction = new ol.interaction.Modify({
                features: new ol.Collection(vectorLayer.getSource().getFeatures())
            });
            map.addInteraction(interaction);
            break;
        default:
            break;
    }
});

interaction = new ol.interaction.Draw({
    type: 'Point',
    source: vectorLayer.getSource()
});

var layerVectorPoint = new ol.layer.Heatmap({
    source: new ol.source.GeoJSON({
        url: 'data/sites2g.geojson',
        projection: 'EPSG:3857'
    })
});
map.addLayer(layerVectorPoint);
var features;
var layerVectorPoint;
var list =  []

$.getJSON("data/sites2g.geojson", function(data) {
    features = new ol.format.GeoJSON().readFeatures( data, {
        featureProjection: 'EPSG:3857'
    } );
    for(x in features) {
        var props = features[x].getProperties();
        var id = props["SI"]
        list[x]={label:props["SITE_NAME"] + "-" + props["N_SEC"] ,value:props["SI"]};
        features[x].setId(id);
    }
    var source = new ol.source.Vector({
        features: features,
    });
    layerVectorPoint = new ol.layer.Heatmap({
        source:source
    });
    console.log(layerVectorPoint.getSource().getFeatures().length);
    map.addLayer(layerVectorPoint);
});

var info_site='?';
var pixel = map.getPixelFromCoordinate(clicked_coord)
map.forEachFeatureAtPixel(pixel, function(feature) {
    if(info_site=='?')
        info_site = '<br/>' + feature.get('SITE_NAME') + '<br>';
    //console.log(".....");
});
if(info_site!='?') str = str+info_site;

//Geolocation
var geolocation = new ol.Geolocation({
    projection: map.getView().getProjection(),
    tracking: true
});

geolocation.bindTo('projection', map.getView());
geolocation.on('change:position', function() { //real time tracking
    //map.getView().setCenter(geolocation.getPosition());
    //map.getView().setZoom(15);
    map.getView().setCenter(geolocation.getPosition());
    console.log(geolocation.getPosition())
    map.getView().setZoom(19);
    var marker = new ol.Overlay({
        position: geolocation.getPosition(),
        element: document.getElementById("location"),
        stopEvent: false,
        positioning: "center-center",
    });
    map.addOverlay(marker);
});
$("#global").on("click", function () {
    map.getView().fit(map.getView().calculateExtent());
    map.getView().setZoom(0);
});
var input = document.getElementById("sites");
var awesomplete = new Awesomplete(input, {
    minChars: 1,
    maxItems: 20,
    autoFirst: true
});


awesomplete.list = list;

function goToSite() {
    var input = document.getElementById ("sites");
    var siteID = input.value;
    console.log(siteID);
    console.log(layerVectorPoint);
    var obj = layerVectorPoint.getSource().getFeatureById(siteID)
    var coords = obj.getGeometry().getExtent()
    map.getView().setCenter([coords[0],coords[1]]);
    map.getView().setZoom(20);
};

