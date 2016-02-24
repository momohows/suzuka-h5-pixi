/**
 * Created by susanph.huang on 2015/12/30.
 */


class Config {

    private static _instance:Config;

    public static defaultHeight:number;
    public static canvasScaleRate:number;
    public static scaleRate:number;
    public static stageWidth:number;
    public static stageHeight:number;

    constructor() {

        if (Config._instance) {
            throw new Error("Error: Please use Config.instance() instead of new.");
        }
        Config._instance = this;
    }

    public static instance():Config {
        return Config._instance;
    }

    public static setConfig():void {

        Config.stageWidth = window.innerWidth;
        Config.stageHeight = window.innerHeight;
        Config.scaleRate = window.innerWidth / 480;
    }


}
