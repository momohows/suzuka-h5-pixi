/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>

class ResultView extends AbstractView {

    constructor(name:string, resource:any, id:number, stepid:number) {
        super(name, resource, id, stepid);
    }


    public toCreateElements():void {

        console.log("ResultView.toCreateElements");
        super.toCreateElements();
    }
}