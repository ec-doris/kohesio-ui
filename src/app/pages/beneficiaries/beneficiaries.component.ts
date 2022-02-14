import { AfterViewInit, Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BeneficiaryService } from "../../services/beneficiary.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { Filters } from "../../models/filters.model";
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Beneficiary } from "../../models/beneficiary.model";
import { FilterService } from "../../services/filter.service";
import { FiltersApi } from "../../models/filters-api.model";
import { environment } from "../../../environments/environment";
import { BeneficiaryList } from "../../models/beneficiary-list.model";
import { startWith, map, delay } from 'rxjs/operators';
import { MediaMatcher} from '@angular/cdk/layout';

@Component({
    templateUrl: './beneficiaries.component.html',
    styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements AfterViewInit {

    public myForm!: FormGroup;
    public filters!: FiltersApi;
    public dataSource!: MatTableDataSource<Beneficiary>;
    public isLoading = false;
    public count = 0;
    public page = 0;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    displayedColumns: string[] = ['name', 'budget', 'euBudget', 'numberProjects'];
    public advancedFilterExpanded = false;
    public mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;

    constructor(private beneficaryService: BeneficiaryService,
        private filterService: FilterService,
        private formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private media: MediaMatcher) {

            this.mobileQuery = media.matchMedia('(max-width: 768px)');
            this._mobileQueryListener = () => changeDetectorRef.detectChanges();
            this.mobileQuery.addListener(this._mobileQueryListener);

            //TODO ECL side effect
            // this._router.events.subscribe((event: NavigationStart) => {
                
            //     this.page = +this._route.snapshot.queryParamMap.get('page');
                
            //     if (event.navigationTrigger === 'popstate') {

            //         this.page = +event.url.charAt(event.url.length - 1);
                
            //         if(this.paginator){
            //             this.paginator.pageIndex = this.page;
            //         } 
            //         this.performSearch();
            //     }
            // });
         }

    ngOnInit() {

        this.filters = this._route.snapshot.data['filters'];

        this.myForm = this.formBuilder.group({
            name: [this._route.snapshot.queryParamMap.get('name')],
            country: [this.getFilterKey("countries", "country")],
            region: [],
            fund: [this.getFilterKey("funds", "fund")],
            program: [],
            beneficiaryType: [this.getFilterKey("beneficiaryType", "beneficiaryType")],
            sort: [this.getFilterKey("sortBeneficiaries", "sort")]
        });

        this.advancedFilterExpanded = this.myForm.value.fund || this._route.snapshot.queryParamMap.get('program') ||
            this.myForm.value.beneficiaryType;

        if (this._route.snapshot.queryParamMap.get('country')) {
            Promise.all([this.getRegions(), this.getPrograms()]).then(results => {
                if (this._route.snapshot.queryParamMap.get('region')) {
                    this.myForm.patchValue({
                        region: this.getFilterKey("regions", "region")
                    });
                }
                if (this._route.snapshot.queryParamMap.get('program')) {
                    this.myForm.patchValue({
                        program: this.getFilterKey("programs", "program")
                    });
                }
                if (this._route.snapshot.queryParamMap.get('region') ||
                    this._route.snapshot.queryParamMap.get('program')) {
                    this.performSearch();
                }
            });
        }

        if (!this._route.snapshot.queryParamMap.get('region') &&
            !this._route.snapshot.queryParamMap.get('program')) {
            this.performSearch();
        }
    }

    private getFilterKey(type: string, queryParam: string) {
        return this.filterService.getFilterKey(type, this._route.snapshot.queryParamMap.get(queryParam))
    }

    private getFilterLabel(type: string, label: string) {
        return this.filterService.getFilterLabel(type, label)
    }

    ngAfterViewInit(): void {
        this.paginator.pageIndex = this.page;
        this.changeDetectorRef.detectChanges();
    }

    onSubmit() {
        this.dataSource = new MatTableDataSource<Beneficiary>([]);;

        if (this.paginator.pageIndex == 0) {
            this.performSearch();
        } else {
            this.paginator.firstPage();
        }

        this._router.navigate([], {
            relativeTo: this._route,
            queryParams: this.getFormValues(),
            queryParamsHandling: 'merge'
        });
    }

    performSearch() {
        const filters = new Filters().deserialize(this.myForm.value);
        this.isLoading = true;
        let offset = this.paginator ? (this.paginator.pageIndex * this.paginator.pageSize) : 0;
        this.beneficaryService.getBeneficiaries(filters, offset).subscribe((result: BeneficiaryList | null) => {
            if (result){
                this.dataSource = new MatTableDataSource<Beneficiary>(result.list);
                this.count = result.numberResults;
            }
            //this.dataSource.paginator = this.paginator;
            this.isLoading = false;
        });
    }

    getFormValues() {
        return {
            name: this.myForm.value.name ? this.myForm.value.name : null,
            country: this.getFilterLabel("countries", this.myForm.value.country),
            region: this.getFilterLabel("regions", this.myForm.value.region),
            fund: this.getFilterLabel("funds", this.myForm.value.fund),
            program: this.getFilterLabel("programs", this.myForm.value.program),
            sort: this.getFilterLabel("sortBeneficiaries", this.myForm.value.sort),
            beneficiaryType: this.getFilterLabel("beneficiaryType", this.myForm.value.beneficiaryType),
        }
    }

    getRegions(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.filterService.getRegions(this.myForm.value.country).subscribe(regions => {
                resolve(true);
            });
        });
    }

    getPrograms(): Promise<any> {
        return new Promise((resolve, reject) => {
            const country = environment.entityURL + this.myForm.value.country;
            this.filterService.getFilter("programs", { country: country }).subscribe(result => {
                this.filterService.filters.programs = result.programs;
                this.filters.programs = result.programs;
                resolve(true);
            });
        });
    }

    onCountryChange() {
        if (this.myForm.value.country != null) {
            this.getRegions().then();
            this.getPrograms().then();
        }
        this.myForm.patchValue({
            region: null,
            program: null
        });
    }

    resetForm() {
        this.myForm.reset();
    }

    onPaginate(event:any) {
        
        this.paginator.pageIndex = event.pageIndex;
        this.page = event.pageIndex;
        this.performSearch();

        this._router.navigate([], {
            relativeTo: this._route,
            queryParams: {
                page: event.pageIndex === 0 ? 0 : this.page,
            },
            queryParamsHandling: 'merge',
        });
    }

    onSortChange() {
        this.onSubmit();
    }

}
