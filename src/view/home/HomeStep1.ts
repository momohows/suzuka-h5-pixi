/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
class HomeStep1 extends AbstractStep {

    constructor(name:string) {
        super(name);
    }


    private startBtn:JQuery;

    public toCreateElements():void {

        this.startBtn = this.$self.find(".startBtn");
        this.startBtn.bind("click tap", this.onStartBtnStatus.bind(this));
        super.toCreateElements();
    }

    private onStartBtnStatus(event:any):void {

        if (event.currentTarget.className == "startBtn") {

            this.toTransitionOut(0, 1);
        }
    }
}

