import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { MapComponent } from 'src/app/components/kohesio/map/map.component';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Renderer2, Inject } from '@angular/core';
import { StatisticsService } from 'src/app/services/statistics.service';
import { Filters } from 'src/app/models/filters.model';
import { ThemeService } from 'src/app/services/theme.service';
import { Theme } from 'src/app/models/theme.model';
import { PolicyObjective } from 'src/app/models/policy-objective.model';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomePageComponent implements AfterViewInit {

    @ViewChild(MapComponent) map!: MapComponent;

    // public index = 0;
    public stats:any = {};
    filterValue: string = "";
    public homePageThemes!: Theme[];
    public policyObjective!: PolicyObjective;

    constructor(private _renderer2: Renderer2,
                @Inject(DOCUMENT) private _document: Document,
                private _router: Router,
                private statisticsService: StatisticsService,
                private themeService: ThemeService){

        this.statisticsService.getKeyFigures().subscribe((data)=>{
            this.stats = data;
        });
        this.themeService.getThemes().subscribe((themes)=>{
            this.homePageThemes = themes.filter((theme:Theme)=>{
                return theme.id == "TO04" || theme.id == "TO05" || theme.id == "TO06";
            });
        });
        this.themeService.getPolicyObjectives().subscribe((policyObjectives)=>{
            const policy = policyObjectives.find((policyObjective:PolicyObjective)=>{
                return policyObjective.wikibaseId == "Q2547987";
            });
            if (policy){
                this.policyObjective = policy;
            }
        });

    }

    ngAfterViewInit(): void {
        setTimeout(
            () => {
                this.map.loadMapRegion(new Filters());
            }, 500);

        
    }

    public ngOnInit() {
        // setInterval((() => {
        //     this.index = (this.index === 2) ? 0 : this.index + 1;
        // }), 5000);
    }


    onFilter(){
        if (this.filterValue && this.filterValue.trim() != "") {
            this._router.navigate(['/projects'], { queryParams: { keywords: this.filterValue } });
            this.filterValue = "";
        }
    }

}