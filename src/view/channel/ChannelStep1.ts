/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
class ChannelStep1 extends AbstractStep {

    private singleBtn:JQuery;
    private multiBtn:JQuery;

    constructor(name:string) {

        super(name);
    }


    public toCreateElements():void {

        this.singleBtn = this.$self.find(".singleBtn");
        this.singleBtn.bind("click tap", this.onBtnStatus.bind(this));

        this.multiBtn = this.$self.find(".multiBtn");
        this.multiBtn.bind("click tap", this.onBtnStatus.bind(this));

        super.toCreateElements();
    }


    private onBtnStatus(event:any):void {

        if (event.currentTarget.className == "singleBtn") {

            GameConfig.gameType = "SingleGame";
            this.toTransitionOut(0, 0);
        }

        if (event.currentTarget.className == "multiBtn") {

            GameConfig.gameType = "MultiGame";
            App.gameConfig.toInitSocket();
        }
    }

}

