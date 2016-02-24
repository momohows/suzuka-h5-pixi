/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
class WaitStep1 extends AbstractStep {

    private goBtn:JQuery;

    constructor(name:string) {

        super(name);
    }


    public toCreateElements():void {

        this.goBtn = this.$self.find(".goBtn");
        this.goBtn.css("display", "none");

        if (GameConfig.gameActor == "LEADER") {

            this.goBtn.css("display", "block");
            this.goBtn.bind("click tap", this.onBtnStatus.bind(this));
        }

        super.toCreateElements();
    }


    private onBtnStatus(event:any):void {

        if (event.currentTarget.className == "goBtn") {

            console.log("XXXX");
        }
    }

}

