/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>

class WaitPixiView extends AbstractPixiView {

    private carSp:PIXI.Sprite;
    private waitText:PIXI.Sprite;

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

        var carTexture:PIXI.Texture = this.resources["wait_car_" + GameConfig.gameId].texture;
        this.carSp = new PIXI.Sprite(carTexture);
        this.carSp.scale.x = Config.scaleRate;
        this.carSp.scale.y = Config.scaleRate;
        this.carSp.x = (Config.stageWidth - this.carSp.width) * 0.5;
        this.carSp.y = (Config.stageHeight - this.carSp.height) * 0.5;
        this.addChild(this.carSp);

        this.waitText = new PIXI.Sprite(this.resources["wait_text"].texture);
        this.waitText.scale.x = Config.scaleRate;
        this.waitText.scale.y = Config.scaleRate;
        this.waitText.x = (Config.stageWidth - this.waitText.width) * 0.5;
        this.waitText.y = Config.stageHeight - this.waitText.height - 50;
        this.addChild(this.waitText);

        super.toCreateElements();
    }

    public toUpdate():void {
        super.toUpdate();
    }


}