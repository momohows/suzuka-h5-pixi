/**
 * Created by susanph.huang on 2016/2/22.
 */

/// <reference path="../definition/jquery/jquery.d.ts"/>
/// <reference path="core/GameScene.ts"/>
/// <reference path="core/GameRes.ts"/>
/// <reference path="config/GameConfig.ts"/>
/// <reference path="utils/Util.ts"/>
/// <reference path="LoadingUI.ts"/>
/// <reference path="view/HomeView.ts"/>
/// <reference path="view/ChannelView.ts"/>
/// <reference path="view/WaitView.ts"/>
/// <reference path="view/GameView.ts"/>
/// <reference path="view/ResultView.ts"/>
/// <reference path="view/HomePixiView.ts"/>
/// <reference path="view/ChannelPixiView.ts"/>
/// <reference path="view/WaitPixiView.ts"/>
/// <reference path="view/GamePixiView.ts"/>
/// <reference path="view/ResultPixiView.ts"/>

module App {

    $(document).ready(function () {

        Config.setConfig();
        Config.defaultHeight = $("#navCon").height();

        toCrateGamePlayer();
    });


    /**
     * 一開始判斷URL有無帶Key參數，若有就是MEMBER
     * */
    function toCheckUrl():void {

        GameConfig.channelKey = Util.toGetParam("key");
        if (GameConfig.channelKey == "" || /[A-Za-z0-9]{8}/.test(GameConfig.channelKey) == false) {

            toCreateView(viewId);
            toCreatePixiView(viewId);

        } else {

            GameConfig.gameActor = "MEMBER";
            gameConfig.toInitSocket();
        }
    }


    /**
     * PIXI GAME
     * */
    var gameScene:GameScene;

    function toCrateGamePlayer() {

        gameScene = new GameScene({
            width: window.innerWidth,
            height: window.innerHeight,
            bgColor: 0,
            transparent: true,
            fps: true
        });

        toInitGameConfig();
        toCreateLoadingUI();
        toLoadResConfig();
    }


    /**
     * LoadingUI
     * */
    export var loadingUI:LoadingUI;

    function toCreateLoadingUI():void {
        loadingUI = new LoadingUI("preLoading");
    }


    /**
     * Resource
     * */
    export var RES:GameRes;

    function toLoadResConfig():void {

        RES = GameRes.instance();
        RES.on(ResourceEvent.CONFIG_COMPLETE, onResConfigComplete);
        RES.toLoadConfig("resource/resource.json", "resConfig");
    }

    function onResConfigComplete():void {

        RES.on(ResourceEvent.GROUP_PROGRESS, onResGroupProgress);
        RES.on(ResourceEvent.GROUP_COMPLETE, onResGroupComplete);

        RES.toQueueGroups("home_assets", 0);
        RES.toQueueGroups("channel_assets", 1);
        RES.toQueueGroups("wait_assets", 2);
        RES.toQueueGroups("game_assets", 3);
        RES.toQueueGroups("result_assets", 4);
        RES.toLoadGroup();
    }

    function onResGroupProgress(progress:number):void {
        //console.log("progress:" + progress);
        loadingUI.onProgress(progress);
    }

    function onResGroupComplete(complete:string):void {

        if (complete == "nav_assets") {
        }

        if (complete == "result_assets") {

            loadingUI.toTransitionOut();

            viewData[0]["isLoaded"] = true;
            viewData[1]["isLoaded"] = true;
            viewData[2]["isLoaded"] = true;
            viewData[3]["isLoaded"] = true;
            viewData[4]["isLoaded"] = true;
            toCheckUrl();
        }
    }

    /* ============================================= */


    /**
     * HTMLView
     * */
    var viewData:Array<any> = [
        {name: "home", h5Class: HomeView, pixiClass: HomePixiView, isLoaded: false},
        {name: "channel", h5Class: ChannelView, pixiClass: ChannelPixiView, isLoaded: false},
        {name: "wait", h5Class: WaitView, pixiClass: WaitPixiView, isLoaded: false},
        {name: "game", h5Class: GameView, pixiClass: GamePixiView, isLoaded: false},
        {name: "result", h5Class: ResultView, pixiClass: ResultPixiView, isLoaded: false}
    ];
    var viewId:number = 0;
    var h5View:AbstractView;

    function toCreateView(id:number, stepid:number = 0):void {

        if (h5View != null) {
            h5View.toTransitionOut(id, stepid);
            return;
        }

        viewId = id;
        var viewResource:any = RES.toGetRes(viewData[id]["name"] + "_assets");

        var H5Class:any = viewData[id]["h5Class"];
        h5View = new H5Class(viewData[id]["name"], viewResource, id, stepid);
        h5View.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, onH5ViewStatus);
        h5View.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, onH5ViewStatus);
    }


    function onH5ViewStatus(event:any, id?:number, stepid?:number):void {

        event.stopPropagation();
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {

        }

        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {

            h5View = null;

            if (h5View == null) {
                console.log("h5View is KILLED");
            }
            toCreateView(id, stepid);
        }
    }


    /**
     * PIXIView
     * */
    export var pixiView:AbstractPixiView;

    function toCreatePixiView(id:number, stepid:number = 0):void {


        if (pixiView != null) {
            pixiView.toTransitionOut(id, stepid);
            return;
        }

        var viewResource:any = RES.toGetRes(viewData[id]["name"] + "_assets");

        var PixiClass:any = viewData[id]["pixiClass"];
        pixiView = new PixiClass(viewData[id]["name"], viewResource, id, stepid);
        pixiView.once(ViewEvent.TRANSITION_IN_COMPLETE, onPixiViewStatus);
        pixiView.once(ViewEvent.TRANSITION_OUT_COMPLETE, onPixiViewStatus);
        gameScene.addChildAt(pixiView, 0);
    }


    function onPixiViewStatus(event:any):void {

        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {

        }

        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {

            gameScene.removeChild(pixiView);
            pixiView.destroy();
            pixiView = null;

            if (pixiView == null) {
                console.log("pixiView is KILLED");
            }

            toCreatePixiView(event.id, event.stepid);
        }
    }


    /**
     * GameConfig
     * */

    export var gameConfig:GameConfig;

    function toInitGameConfig():void {

        gameConfig = GameConfig.instance();
        gameConfig.toInit();

        gameConfig.on(GameEvent.ON_SERVER_CONNECTED, onGameConfigStatus);
        gameConfig.on(GameEvent.ON_CHANNEL_STATUS, onGameConfigStatus);
        gameConfig.on(GameEvent.CHANNEL_LOCKED, onGameConfigStatus);
        gameConfig.on(GameEvent.ON_GAME_UPDATE, onGameConfigStatus);
    }

    function onGameConfigStatus(event:any):void {


        console.log(GameConfig.gameActor + ":" + event.type + "==>" + event.status);

        /* LEADER */
        if (GameConfig.gameActor == "LEADER") {

            switch (event.type) {

                case GameEvent.ON_SERVER_CONNECTED:

                    toCreateView(1, 1);
                    break;

                case GameEvent.ON_CHANNEL_STATUS:

                    if (!GameConfig.isWaiting) {

                        toCreateView(1, 2);
                        GameConfig.isWaiting = true;
                    }
                    break;

                case GameEvent.CHANNEL_LOCKED:

                    toCreateView(1, 4);
                    break;

                case GameEvent.ON_GAME_UPDATE:


                    if (event.status == "toStandBy") {
                        toCreateView(3, 0);
                    }

            }
        }


        /* MEMBER */
        if (GameConfig.gameActor == "MEMBER") {
            switch (event.type) {

                case GameEvent.ON_SERVER_CONNECTED:
                    var deviceArr:Array<any> = [Config.stageWidth, Config.stageHeight];
                    App.gameConfig.toConnectSocket({
                        key: GameConfig.channelKey,
                        act: SocketEvent.JOIN_CHANNEL,
                        device: GameUtil.encodeArray(deviceArr)
                    });
                    break;


                case GameEvent.ON_CHANNEL_STATUS:

                    if (!GameConfig.isWaiting) {

                        toCreateView(2, 0);
                        toCreatePixiView(2, 0);
                        GameConfig.isWaiting = true;
                    }
                    break;

                case GameEvent.ON_GAME_UPDATE:

                    if (event.status == "toStandBy") {

                        toCreateView(3, 0);
                    }
                    break;

            }
        }
    }

    /* ============================================= */
}
