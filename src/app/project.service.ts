import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {Project} from "./shared/models/project.model";
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Filters} from "./shared/models/filters.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

    constructor(private http: HttpClient) { }

    getProjects(filters:Filters): Observable<Project[]>  {
        const queryProjects = 'SELECT DISTINCT ?s0 ?label ?description ?startTime ?euBudget ?image ?coordinates ?objectiveId ?countrycode WHERE { ' +
            '  ?s0 <https://linkedopendata.eu/prop/direct/P35> <https://linkedopendata.eu/entity/Q9934>. ' +
            '  { ' +
            '    ?s0 rdfs:label ?label. ' +
            '    FILTER((LANG(?label)) = "en") ' +
            '  }' +
            '  {' +
            '    ?s0 <https://linkedopendata.eu/prop/direct/P836> ?description. ' +
            '    FILTER((LANG(?description)) = "en")' +
            '  }' +
            '  { ?s0 <https://linkedopendata.eu/prop/direct/P20> ?startTime. } ' +
            '  { ?s0 <https://linkedopendata.eu/prop/direct/P835> ?euBudget. }' +
            '  OPTIONAL { ?s0 <https://linkedopendata.eu/prop/direct/P147> ?image. }' +
            '  OPTIONAL { ?s0 <https://linkedopendata.eu/prop/direct/P851> ?image. }' +
            '  { ?s0 <https://linkedopendata.eu/prop/direct/P127> ?coordinates. }' +
            '  { ?s0 <https://linkedopendata.eu/prop/direct/P888> ?category. }' +
            '  { ?category <https://linkedopendata.eu/prop/direct/P302> ?objective. }' +
            '  { ?objective <https://linkedopendata.eu/prop/direct/P1105> ?objectiveId. }' +
            '  { ?s0 <https://linkedopendata.eu/prop/direct/P32> ?country .}' +
            '  { ?country <https://linkedopendata.eu/prop/direct/P173> ?countrycode .}' +
            this.generateFilters(filters) +
            '}' +
            'LIMIT 12';
        const urlProjects = encodeURI('api/bigdata/namespace/wdq/sparql?query=' + queryProjects);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/sparql-results+json'
            })
        };

        return this.http.get<any>(urlProjects).pipe(
            map(data => data.results.bindings.map(data => new Project().deserialize(data)))
        );
    }

    private generateFilters(filters: Filters){
        let filtersQuery = "";
        if (filters){
            if (filters.countries && filters.countries.length > 0){
                filtersQuery += '{';
                for (let i=0; i<filters.countries.length; ++i) {
                    let country = filters.countries[i];
                    let countryCode = country.split(",")[0];
                    filtersQuery += '{?s0 <https://linkedopendata.eu/prop/direct/P32> <https://linkedopendata.eu/entity/Q' + countryCode + '>}';
                    filtersQuery += (filters.countries.length > 1 && i !== filters.countries.length -1) ? ' UNION' : '';
                }
                filtersQuery += '}';
            }
            if (filters.topics && filters.topics.length > 0){
                filtersQuery += '{';
                for (let i=0; i<filters.topics.length; ++i) {
                    let topic = filters.topics[i];
                    filtersQuery += '{?objective <https://linkedopendata.eu/prop/direct/P1105> "' + topic + '"}';
                    filtersQuery += (filters.topics.length > 1 && i !== filters.topics.length -1) ? ' UNION' : '';
                }
                filtersQuery += '}';
            }
        }
        return filtersQuery;
    }

}