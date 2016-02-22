/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../../definition/jquery/jquery.d.ts" />
/// <reference path="../../definition/greensock/greensock.d.ts" />
class AbstractView {

    public viewId:number = -1;
    public $self:JQuery;

    constructor(name:string) {

        this.$self = $(name);
        this.$self.css({
            "display": "none",
            "opacity": 0
        });

        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }

    public toRemoved():void {

        this.$self.unbind();
        TweenMax.killChildTweensOf(this.$self);
    }

    public onResize(event:any):void {
    }

    private toInit():void {

        this.toCreateElements();
        this.onResize(null);
    }

    public toCreateElements():void {
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

    public toTransitionOut(_id:number):void {

        TweenMax.to(this.$self, 0.3, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", _id]
        });
    }

    public onTransitionComplete(_type:string, _id?:number):void {

        if (_type == "TRANSITION_IN_COMPLETE") {
            this.$self.trigger(ViewEvent.TRANSITION_IN);
        }

        if (_type == "TRANSITION_OUT_COMPLETE") {

            this.$self.css("display", "none");
            this.$self.trigger(ViewEvent.TRANSITION_OUT, [_id]);
        }
    }
}