/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>

class WaitView extends AbstractView {

    constructor(name:string, resource:any, id:number, stepid:number) {
        super(name, resource, id, stepid);
    }


    /**
     * Step
     * */
    private stepData:Array<Object> = [
        {name: "waitStep1", className: ChannelStep1}
    ];

    public toCreateStep(id:number):void {

        var StepClass:any = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"]);
        this.stepView.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
    }

    private onStepViewStatus(event:any, stepid?:number, pid?:number):void {

        event.stopPropagation();
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {

        }

        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {

            this.stepView = null;

            if (pid == -1) {

                this.toCreateStep(stepid);

            } else {

                App.pixiView.toTransitionOut(pid, stepid);
                this.toTransitionOut(pid, stepid);
            }
        }
    }
}