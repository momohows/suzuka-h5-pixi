/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../../definition/jquery/jquery.d.ts" />
/// <reference path="../../definition/greensock/greensock.d.ts" />
/// <reference path="../events/ViewEvent.ts"/>
/// <reference path="../abstract/AbstractStep.ts"/>

class AbstractView {

    public id:number = -1;
    public stepId:number = -1;
    public $self:JQuery;
    public stepView:AbstractStep;
    public name:string;
    public resource:any;

    constructor(name:string, resource:any, id:number = 0, stepid:number = 0) {

        this.name = name;
        this.resource = resource;
        this.id = id;
        this.stepId = stepid;

        this.$self = $("#" + name + "View");
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

    public toCreateStep(id:number):void {
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

    public toTransitionOut(id:number = -1, stepid:number = -1):void {

        if (this.stepView) {

            if (id == this.id) {

                this.stepView.toTransitionOut(stepid, -1);

            } else {

                this.stepView.toTransitionOut(stepid, id);
            }
            return;
        }

        TweenMax.to(this.$self, 0.3, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", id, stepid]
        });
    }

    public onTransitionComplete(type:string, id?:number, stepid?:number):void {

        if (type == "TRANSITION_IN_COMPLETE") {

            this.toCreateStep(this.stepId);
            this.$self.trigger(ViewEvent.TRANSITION_IN_COMPLETE);
        }

        if (type == "TRANSITION_OUT_COMPLETE") {

            this.$self.css("display", "none");
            this.$self.trigger(ViewEvent.TRANSITION_OUT_COMPLETE, [id, stepid]);
        }
    }
}