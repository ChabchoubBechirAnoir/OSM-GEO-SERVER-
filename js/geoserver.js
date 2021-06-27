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
lyr_adm1.setVisible(true);
//déclaration de la liste des couches à afficher
var layersList = [lyr_adm1];
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
        projection: "EPSG:4326",
        center: [9.37884, 34.240721],
        zoom: 7,
    }),
});