/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>

class ChannelPixiView extends AbstractPixiView {

    constructor(name:string, resources:Object, id:number, stepid:number) {

        super(name, resources, id, stepid);
    }

    public toRemove():void {

        super.toRemove();
    }

    public onResize(event):void {

        super.onResize(event);
    }

    public toCreateElements():void {

        super.toCreateElements();
    }

    public toUpdate():void {
        super.toUpdate();
    }


}