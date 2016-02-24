/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../../definition/jquery/jquery.d.ts" />
/// <reference path="../../definition/greensock/greensock.d.ts" />
/// <reference path="../events/ViewEvent.ts"/>
class AbstractStep {

    public stepId:number = -1;
    public $self:JQuery;
    public resource:any;

    constructor(name:string) {

        this.$self = $("." + name);
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


    public toTransitionIn():void {

        this.$self.css("display", "block");
        TweenMax.to(this.$self, 0.3, {
            delay: 0.5,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    }

    public toTransitionOut(stepid:number = -1, pid:number = -1):void {

        TweenMax.to(this.$self, 0.3, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", stepid, pid]
        });
    }

    public onTransitionComplete(type:string, stepid:number = -1, pid:number = -1):void {

        TweenMax.killChildTweensOf(this.$self);

        if (type == "TRANSITION_IN_COMPLETE") {
            this.$self.trigger(ViewEvent.TRANSITION_IN_COMPLETE);
        }

        if (type == "TRANSITION_OUT_COMPLETE") {

            this.$self.css("display", "none");
            this.$self.trigger(ViewEvent.TRANSITION_OUT_COMPLETE, [stepid, pid]);
        }
    }
}