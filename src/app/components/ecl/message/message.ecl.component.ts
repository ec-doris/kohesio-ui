import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'kohesio-ecl-message',
    templateUrl: './message.ecl.component.html',
})
export class KohesioMessageEclComponent {

    @Input()
    type:'info' | 'success' | 'warning' | 'error' = "info";

    @Input()
    message!:string;

    title:string = 'Info message';

    classType:string = 'ecl-message--info';

    closed:boolean = false;

    @Output() dismissMessage: EventEmitter<any> = new EventEmitter();

    constructor(){}

    ngOnInit(){
      if(this.type == 'error'){
        this.title = "Error message";
        this.classType = 'ecl-message--error';
      }else if(this.type == 'success'){
        this.title = "Success message";
        this.classType = 'ecl-message--success';
      }else if(this.type == 'warning'){
        this.title = "Warning message";
        this.classType = 'ecl-message--warning';
      }
    }

    onClose(){
      this.closed=true;
      this.dismissMessage.emit(this.type);
    }

}
