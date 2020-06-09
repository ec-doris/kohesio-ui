import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { ProjectsRoutingModule } from './projects-routing.module';

import { ProjectsComponent } from './projects.component';
import {BudgetPipe} from "../../shared/budget.pipe";

import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {ProjectDetailComponent} from "./project-detail.component";

@NgModule({
    imports: [
        SharedModule,
        ProjectsRoutingModule,
        MatPaginatorModule,
        MatTableModule
    ],
    declarations: [
        ProjectsComponent,
        ProjectDetailComponent,
        BudgetPipe
    ],
})
export class Module {}
