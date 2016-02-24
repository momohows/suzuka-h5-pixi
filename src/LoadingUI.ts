/**
 * Created by susanph.huang on 2016/1/4.
 */

/// <reference path="../definition/jquery/jquery.d.ts"/>
/// <reference path="../definition/greensock/greensock.d.ts" />
class LoadingUI {

    public $self:JQuery;
    public resource:any;

    constructor(name:string) {

        this.$self = $("#" + name);
        this.$self.css({
            "display": "none",
            "opacity": 0
        });

        $(window).resize(this.onResize.bind(this));
        this.toCreateElements();
    }

    public toRemoved():void {

        this.$self.unbind();
        TweenMax.killChildTweensOf(this.$self);
    }

    public onResize(event:any):void {

    }


    public toCreateElements():void {

        this.onResize(null);
        this.toTransitionIn();
    }


    public onProgress(progress:number):void {
        console.clear();
        console.log("progress:" + progress);
    }


    public toTransitionIn():void {

        this.$self.css("display", "block");
        TweenMax.to(this.$self, 0.3, {
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    }

    public toTransitionOut():void {

        TweenMax.to(this.$self, 0.5, {
            delay: 0.5,
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE"]
        });
    }

    private onTransitionComplete(type:string):void {

        if (type == "TRANSITION_IN_COMPLETE") {

        }

        if (type == "TRANSITION_OUT_COMPLETE") {
            this.$self.css({
                "display": "none",
                "opacity": 0
            });
        }
    }
}
