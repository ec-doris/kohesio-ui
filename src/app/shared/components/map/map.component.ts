import { AfterViewInit, Component } from '@angular/core';
import {MarkerService} from "../../../services/marker.service";
import {FilterService} from "../../../services/filter.service";
declare let L;

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html'
})
export class MapComponent implements AfterViewInit {

    private map;
    private markersGroup;
    private layers: any[] = [];


    constructor(private markerService:MarkerService,
                private filterService:FilterService) { }

    ngAfterViewInit(): void {
        this.map = L.map('map').setView([48, 4], 4);
        const tiles = L.tileLayer('https://europa.eu/webtools/maps/tiles/osmec2/{z}/{x}/{y}', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
                '| &copy; <a href="https://ec.europa.eu/eurostat/web/gisco">GISCO</a>'
        });
        /*const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        });*/
        tiles.addTo(this.map);
        L.Icon.Default.prototype.options = {
            iconUrl: 'assets/images/map/marker-icon-2x.png',
            shadowUrl: 'assets/images/map/marker-shadow.png'
        }

        //this.markerService.makeMarkers(this.map);

    }

    public addMarker(latitude, longitude, centralize=true, zoomWhenCentralize = 15, popupContent:string = undefined){
        const coords = [latitude,longitude];
        if (this.map) {
            if (!this.markersGroup){
                this.markersGroup = new L.FeatureGroup();
                this.map.addLayer(this.markersGroup);
            }
            const marker = L.marker(coords,
                {
                    icon: L.icon({
                        iconUrl: 'assets/images/map/marker-icon-2x.png',
                        shadowUrl: 'assets/images/map/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        tooltipAnchor: [16, -28],
                        shadowSize: [41, 41]
                    })
                }
            );


            if (popupContent) {
                marker.bindPopup(popupContent);
            }

            this.markersGroup.addLayer(marker);

            if (centralize) {
                this.map.setView(coords, zoomWhenCentralize);
            }
        }
    }

    public addMarkerPopup(latitude: any, longitude: any, popupContent: string){
        this.addMarker(latitude, longitude, false, 15, popupContent)
    }

    public addCircleMarker(latitude: any, longitude: any){
        if (!this.markersGroup){
            this.markersGroup = new L.FeatureGroup();
            this.map.addLayer(this.markersGroup);
        }
        const circleMarker = L.circleMarker([latitude,longitude]);

        this.markersGroup.addLayer(circleMarker);
    }

    public addCountryLayer(countryLabel: string){
        let countryGeoJson = undefined;
        this.filterService.getCountryGeoJson().then(data=>{
           data.forEach(country=>{
               if (country.properties.name === countryLabel){
                   countryGeoJson = country
               }
            });
            const countriesData = {
                "type": "FeatureCollection",
                "features": [countryGeoJson]
            };
            L.geoJson(countriesData).addTo(this.map);
        });
    }

    public drawPolygons(polygons){
        return L.geoJson(polygons).addTo(this.map);
    }

    public addLayer(layerGeoJson, clickCallback, style){
        const l = L.geoJson(layerGeoJson,{
            onEachFeature: clickCallback,
            style: style
        }).addTo(this.map);
        const center = l.getBounds().getCenter();
        const labelMarker = L.marker(center, {
            icon: L.divIcon({
                className: 'label',
                html: layerGeoJson.features[0].properties.regionLabel + "(" + layerGeoJson.features[0].properties.count + ") projects",
                iconSize: [100, 40]
            })
        });
        if (layerGeoJson.features[0].properties.count) {
            const html = "<div class='regionWrapper'>" +
                "<div class='regionName'>" + layerGeoJson.features[0].properties.regionLabel + "</div>" +
                "<div class='regionCount'>" + layerGeoJson.features[0].properties.count + " projects</div>" +
                "</div>";
            l.bindTooltip(html, {permanent: true, direction: "center"})
        }
        this.layers.push(l);
    }

    public cleanAllLayers(){
        this.layers.forEach(layer=>{
            this.map.removeLayer(layer);
        });
    }

    public refreshView(){
        setTimeout(() => {
            this.map.invalidateSize(true);
            },100);
    }

    public removeAllMarkers(){
        if (this.map && this.markersGroup) {
            this.map.removeLayer(this.markersGroup);
            this.markersGroup = null;
        }
    }

    public fitBounds(bounds){
        if (this.map) {
            this.map.fitBounds(bounds);
        }
    }

}
