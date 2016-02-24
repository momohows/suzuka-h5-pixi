/**
 * Created by susanph.huang on 2015/12/30.
 */
var Config = (function () {
    function Config() {
        if (Config._instance) {
            throw new Error("Error: Please use Config.instance() instead of new.");
        }
        Config._instance = this;
    }
    Config.instance = function () {
        return Config._instance;
    };
    Config.setConfig = function () {
        Config.stageWidth = window.innerWidth;
        Config.stageHeight = window.innerHeight;
        Config.scaleRate = window.innerWidth / 480;
    };
    return Config;
})();
/**
 * Created by susanph.huang on 2015/12/3.
 */
var GameEvent;
(function (GameEvent) {
    GameEvent.ON_GAME_UPDATE = "onGameUpdate";
    /* Game Channel */
    GameEvent.ON_JOIN_CHANNEL = "onJoinChannel";
    GameEvent.ON_CHANNEL_STATUS = "onChannelStatus";
    GameEvent.ON_SERVER_CONNECTED = "onServerConnected";
    GameEvent.ON_SERVER_DISCONNECTED = "onServerDisconnected";
    GameEvent.CHANNEL_LOCKED = "channelLocked";
    /* Game */
    GameEvent.ON_COUNTDOWN = "onCountDown";
})(GameEvent || (GameEvent = {}));
/**
 * Created by susanph.huang on 2015/12/4.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../definition/pixi/pixi.js.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../../definition/fpsmeter/FPSMeter.d.ts"/>
/// <reference path="../config/Config.ts"/>
/// <reference path="../events/GameEvent.ts"/>
var GameScene = (function (_super) {
    __extends(GameScene, _super);
    function GameScene(option) {
        _super.call(this);
        this.option = {
            width: 0,
            height: 0,
            bgColor: 0,
            transparent: true,
            fps: true
        };
        this.toChangeOption(option);
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    GameScene.prototype.onResize = function (event) {
        this.renderer.resize(window.innerWidth, window.innerHeight);
        Config.stageWidth = this.canvas.width;
        Config.stageHeight = this.canvas.height;
    };
    GameScene.prototype.toChangeOption = function (option) {
        for (var key in option) {
            this.option[key] = option[key];
        }
    };
    GameScene.prototype.toInit = function () {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "pixiPlayer";
        this.canvas.style.position = "absolute";
        this.playerCon = document.getElementById("playerCon");
        this.playerCon.appendChild(this.canvas);
        var renderOption = {
            view: this.canvas,
            //resolution: window.devicePixelRatio,
            resolution: 1,
            backgroundColor: this.option["bgColor"],
            transparent: this.option["transparent"]
        };
        this.renderer = PIXI.autoDetectRenderer(this.option["width"], this.option["height"], renderOption);
        //this.toFixRatio();
        this.toUpdate();
        if (this.option["fps"]) {
            this.toCreateFpsMeter();
        }
    };
    GameScene.prototype.toFixRatio = function () {
        // TODO 如果哪天html viewport不再支援，必須再研究
        Config.canvasScaleRate = 1 / window.devicePixelRatio;
        this.canvas.style.transform = 'scale3d(' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ',' + Config.canvasScaleRate + ')';
        this.canvas.style.transformOrigin = '0 0';
        Config.stageWidth = this.canvas.width * Config.canvasScaleRate;
        Config.stageHeight = this.canvas.height * Config.canvasScaleRate;
    };
    GameScene.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
        if (this.meter) {
            this.meter.tick();
        }
        this.renderer.render(this);
    };
    GameScene.prototype.toCreateFpsMeter = function () {
        /**
         * FPS Meter
         * website:http://darsa.in/fpsmeter/
         * github:https://github.com/Darsain/fpsmeter/
         * */
        this.meter = new FPSMeter(document.body, {
            theme: 'transparent',
            heat: 1,
            graph: 1,
            history: 20 // How many history states to show in a graph.
        });
    };
    return GameScene;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var ResourceEvent;
(function (ResourceEvent) {
    ResourceEvent.CONFIG_COMPLETE = "configComplete";
    ResourceEvent.GROUP_COMPLETE = "groupComplete";
    ResourceEvent.GROUP_PROGRESS = "groupProgress";
    ResourceEvent.GROUP_LOAD_ERROR = "groupLoadError";
})(ResourceEvent || (ResourceEvent = {}));
/**
 * Created by susanph.huang on 2015/12/28.
 */
/// <reference path="../events/ResourceEvent.ts"/>
var GameRes = (function (_super) {
    __extends(GameRes, _super);
    function GameRes() {
        _super.call(this);
        /**
         *
         * */
        this.loadedGroups = [];
        this.loadDelayGroups = [];
        this.loadingGroup = "";
        if (GameRes._instance) {
            throw new Error("Error: Instantiation failed: Use GameRes.instance() instead of new.");
        }
        GameRes._instance = this;
    }
    GameRes.instance = function () {
        return GameRes._instance;
    };
    GameRes.prototype.toLoadConfig = function (url, name) {
        if (name === void 0) { name = "resConfig"; }
        if (!this.resLoader) {
            this.resLoader = new PIXI.loaders.Loader();
        }
        this.resLoader.once("complete", this.onLoadConfigComplete.bind(this));
        this.resLoader.add(name, url);
        this.resLoader.load();
    };
    GameRes.prototype.onLoadConfigComplete = function (loader, resources) {
        this.resConfig = resources.resConfig.data;
        this.emit(ResourceEvent.CONFIG_COMPLETE);
    };
    GameRes.prototype.toQueueGroups = function (groupName, priority) {
        if (priority === void 0) { priority = 0; }
        //TODO loadDelayGroup priority 搜尋未存入Group，自動重新排序陣列
        var isLoaded = this.toCheckLoaded(groupName);
        if (isLoaded)
            return;
        this.loadDelayGroups[priority] = groupName;
    };
    GameRes.prototype.toLoadGroup = function () {
        var _this = this;
        this.resLoader.reset();
        this.resLoader.on("progress", this.onLoadGroupProgress.bind(this));
        this.resLoader.once("complete", this.onLoadGroupComplete.bind(this));
        this.loadingGroup = this.loadDelayGroups[0];
        var loadList = this.toGetLoadList(this.loadDelayGroups[0]);
        loadList.forEach(function (item) { return _this.resLoader.add(item["name"], item["url"]); });
        this.resLoader.load();
    };
    GameRes.prototype.onLoadGroupProgress = function (loader) {
        this.emit(ResourceEvent.GROUP_PROGRESS, loader.progress);
    };
    GameRes.prototype.onLoadGroupComplete = function (loader, resources) {
        this.loadDelayGroups.shift();
        this.loadedGroups.push({
            name: this.loadingGroup,
            resources: resources
        });
        this.emit(ResourceEvent.GROUP_COMPLETE, this.loadingGroup);
        if (this.loadDelayGroups.length > 0) {
            this.toLoadGroup();
        }
    };
    GameRes.prototype.toGetLoadList = function (groupName) {
        var resources = [];
        this.resConfig["groups"].forEach(function (item) {
            if (item["name"] === groupName) {
                resources = item["resources"];
            }
        });
        return resources;
    };
    GameRes.prototype.toCheckLoaded = function (groupName) {
        var isLoaded = this.loadedGroups.some(function (value) {
            return value["name"] == groupName ? true : false;
        });
        return isLoaded;
    };
    GameRes.prototype.toGetRes = function (groupName) {
        var targetSources = {};
        this.loadedGroups.forEach(function (item) {
            if (item["name"] == groupName) {
                targetSources = item["resources"];
            }
        });
        return targetSources;
    };
    GameRes._instance = new GameRes();
    return GameRes;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2016/1/5.
 */
var SocketConnector = (function (_super) {
    __extends(SocketConnector, _super);
    function SocketConnector() {
        _super.call(this);
        if (SocketConnector._instance) {
            throw new Error("Error: Please use SocketConnector.instance() instead of new.");
        }
    }
    SocketConnector.instance = function () {
        if (!SocketConnector._instance) {
            SocketConnector._instance = new SocketConnector();
        }
        return SocketConnector._instance;
    };
    /**
     * */
    SocketConnector.prototype.toInit = function () {
        this.webSocket = new WebSocket(SocketConnector.socketUrl);
        this.webSocket.onopen = this.onConnect.bind(this);
        this.webSocket.onclose = this.onDisconnect.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.webSocket.onerror = this.onError.bind(this);
    };
    SocketConnector.prototype.toSendMessage = function (msg) {
        this.webSocket.send(JSON.stringify(msg));
    };
    SocketConnector.prototype.toClose = function () {
        this.webSocket.close();
    };
    SocketConnector.prototype.onConnect = function (event) {
        this.emit(SocketEvent.ON_CONNECT_SUCCESS, {
            type: SocketEvent.ON_CONNECT_SUCCESS
        });
    };
    SocketConnector.prototype.onDisconnect = function (event) {
        this.emit(SocketEvent.ON_CLOSE, {
            type: SocketEvent.ON_CLOSE
        });
        console.dir(event);
    };
    SocketConnector.prototype.onError = function (event) {
        this.emit(SocketEvent.ON_CONNECT_ERROR, {
            type: SocketEvent.ON_CONNECT_ERROR
        });
        console.dir(event);
    };
    SocketConnector.prototype.onMessage = function (event) {
        this.emit(SocketEvent.ON_MESSAGE, {
            data: JSON.parse(event.data),
            type: SocketEvent.ON_MESSAGE
        });
    };
    SocketConnector.socketUrl = "ws://52.193.236.98:5000";
    return SocketConnector;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
var SocketEvent;
(function (SocketEvent) {
    /* Websocket事件 */
    SocketEvent.ON_CONNECT_SUCCESS = "onConnectSuccess";
    SocketEvent.ON_CONNECT_ERROR = "onConnectError";
    SocketEvent.ON_CLOSE = "onClose";
    SocketEvent.ON_MESSAGE = "onMessage";
    /* 遊戲串接Websocket事件 */
    SocketEvent.JOIN_CHANNEL = "joinChannel";
    SocketEvent.JOIN_CHANNEL_SUCCESS = "joinChannelSuccess";
    SocketEvent.LOCK_CHANNEL = "lockChannel";
    SocketEvent.LOCK_CHANNEL_SUCCESS = "lockChannelSuccess";
    SocketEvent.GET_CHANNEL_STATUS = "getChannelStatus";
    SocketEvent.UPDATE_CHANNEL_STATUS = "updateChannelStatus";
    /* 遊戲玩家溝通事件 */
    SocketEvent.MEMBER_TO_LEADER = "memberToLeader";
    SocketEvent.UPDATE_GAME = "updateGame"; // =  LEADER_TO_MEMBERS
    SocketEvent.SAVE_DEVICE_DATA = "saveDeviceData";
    SocketEvent.LEADER_TO_MEMBERS = "leaderToMembers";
})(SocketEvent || (SocketEvent = {}));
/**
 * Created by susanph.huang on 2016/1/14.
 */
/// <reference path="../service/SocketConnector.ts"/>
/// <reference path="../events/SocketEvent.ts"/>
var GameConfig = (function (_super) {
    __extends(GameConfig, _super);
    function GameConfig() {
        _super.call(this);
        if (GameConfig._instance) {
            throw new Error("Error: Please use GameConfig.instance() instead of new.");
        }
    }
    GameConfig.instance = function () {
        if (!GameConfig._instance) {
            GameConfig._instance = new GameConfig();
        }
        return GameConfig._instance;
    };
    GameConfig.prototype.toReset = function () {
        GameConfig.gameId = 0;
        GameConfig.totalMembers = 0;
        GameConfig.gameActor = "LEADER";
        GameConfig.channelKey = "";
        GameConfig.isWaiting = false;
        GameConfig.isChannelLocked = false;
        GameConfig.channelMembers = [0, 0, 0, 0];
        GameConfig.membersDeviceWidth = [0, 0, 0, 0];
        GameConfig.membersDeviceHeight = [0, 0, 0, 0];
        GameConfig.membersRacingIndex = [0, 0, 0, 0];
    };
    GameConfig.prototype.toInit = function () {
        this.toReset();
    };
    GameConfig.prototype.toInitSocket = function () {
        if (!this.socketConnector) {
            App.loadingUI.toTransitionIn();
            this.socketConnector = SocketConnector.instance();
            this.socketConnector.toInit();
        }
        this.socketConnector.on(SocketEvent.ON_CONNECT_SUCCESS, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_MESSAGE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CLOSE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CONNECT_ERROR, this.onSocketStatus.bind(this));
    };
    GameConfig.prototype.toConnectSocket = function (msg) {
        this.socketConnector.toSendMessage(msg);
    };
    GameConfig.prototype.onSocketStatus = function (event) {
        App.loadingUI.toTransitionOut();
        switch (event.type) {
            /**
             * Websocket連接成功
             **/
            case SocketEvent.ON_CONNECT_SUCCESS:
                this.emit(GameEvent.ON_SERVER_CONNECTED, {
                    type: GameEvent.ON_SERVER_CONNECTED
                });
                break;
            /* ========================================================= */
            /**
             * Websocket收送Message
             **/
            case SocketEvent.ON_MESSAGE:
                var result = event.data;
                var action = result.act;
                /* 成功加入Channel */
                if (action == SocketEvent.JOIN_CHANNEL_SUCCESS) {
                    GameConfig.channelKey = result.key;
                    GameConfig.gameId = result.memberId;
                    this.emit(GameEvent.ON_JOIN_CHANNEL, {
                        type: GameEvent.ON_JOIN_CHANNEL
                    });
                    /* 正式上線砍掉 */
                    if (GameConfig.gameActor == "LEADER") {
                        console.log(window.location.href + "?key=" + result.key);
                    }
                }
                /* 加入Channel後可取得Channel資訊 */
                if (action == SocketEvent.GET_CHANNEL_STATUS) {
                    GameConfig.channelKey = result.key;
                    GameConfig.totalMembers = result.totalMembers;
                    if (result.totalMembers == 1) {
                        GameConfig.gameActor = "LEADER";
                    }
                    if (GameConfig.gameActor == "LEADER") {
                        if (!GameConfig.isChannelLocked) {
                            GameConfig.channelMembers[result.memberId - 1] = 1;
                        }
                        var deviceArr = GameUtil.decodeStr(result.device, "|");
                        GameConfig.membersDeviceWidth[result.memberId - 1] = deviceArr[0];
                        GameConfig.membersDeviceHeight[result.memberId - 1] = deviceArr[1];
                        this.toUpdateChannelStatus();
                    }
                    this.emit(GameEvent.ON_CHANNEL_STATUS, {
                        type: GameEvent.ON_CHANNEL_STATUS
                    });
                }
                /* LEADER廣播:所有遊戲成員更新Channel資訊 */
                if (action == SocketEvent.UPDATE_CHANNEL_STATUS) {
                    GameConfig.channelMembers = GameUtil.decodeStr(result.channelMembers, "|");
                    GameConfig.isChannelLocked = result.channelLocked;
                    GameConfig.totalMembers = this.toGetTotalMembers();
                    GameConfig.membersDeviceWidth = GameUtil.decodeStr(result.deviceWidth, "|");
                    GameConfig.membersDeviceHeight = GameUtil.decodeStr(result.deviceHeight, "|");
                    console.log("==============================="
                        + "\n" + "key:" + GameConfig.channelKey
                        + "\n" + "id:" + GameConfig.gameId
                        + "\n" + "actor:" + GameConfig.gameActor
                        + "\n" + "members:" + GameConfig.channelMembers
                        + "\n" + "total:" + GameConfig.totalMembers
                        + "\n" + "locked:" + GameConfig.isChannelLocked
                        + "\n" + "deviceW:" + GameConfig.membersDeviceWidth
                        + "\n" + "deviceH:" + GameConfig.membersDeviceHeight
                        + "\n" + "===============================");
                }
                /* 鎖定Channel，阻止玩家加入 */
                if (action == SocketEvent.LOCK_CHANNEL_SUCCESS) {
                    GameConfig.isChannelLocked = true;
                    this.toUpdateChannelStatus();
                    this.emit(GameEvent.CHANNEL_LOCKED, {
                        type: GameEvent.CHANNEL_LOCKED
                    });
                }
                /**
                 * 遊戲開始：
                 * LEADER廣播給所有Channel的遊戲玩家
                 **/
                if (action == SocketEvent.UPDATE_GAME) {
                    /* 如果此時等於0，表示未加入或者是Lock Channel後才加入 */
                    if (GameConfig.channelMembers[GameConfig.gameId - 1] == 0) {
                        alert("遊戲已開始，無法加入！");
                        return;
                    }
                    var status = result.gameStatus;
                    switch (status) {
                        case "toStandBy":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "toStandBy"
                            });
                            break;
                        case "onCountDown":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                countDown: result.countDown,
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "onCountDown"
                            });
                            break;
                        case "startGame":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "startGame"
                            });
                            break;
                        case "memberAction":
                            break;
                        case "stopGame":
                            this.emit(GameEvent.ON_GAME_UPDATE, {
                                type: GameEvent.ON_GAME_UPDATE,
                                status: "stopGame"
                            });
                            break;
                    }
                }
                /**
                 * 遊戲開始：
                 * MEMBERS 傳遞訊息給 LEADER，
                 * 只有LEADER收的到
                 **/
                if (action == SocketEvent.MEMBER_TO_LEADER) {
                    var status = result.gameStatus;
                    switch (status) {
                        case "saveDeviceData":
                            break;
                        case "onMemberReady":
                            /*GameConfig.channelMembers =
                                GameUtil.toSetValueInStr(result.memberId - 1, 2, GameConfig.channelMembers);

                            if (GameConfig.gameActor == "LEADER") {
                                this.toUpdateChannelStatus();
                            }

                            var allMembersReady:boolean = GameUtil.toCheckMemberReady();
                            if (allMembersReady) {
                                this.emit(GameEvent.ON_GAME_UPDATE, {
                                    type: GameEvent.ON_GAME_UPDATE,
                                    status: "allMemberReady"
                                });
                            }*/
                            break;
                        case "onMemberUpdate":
                            /*GameConfig.memberRacingData =
                                GameUtil.toSetValueInStr(result.memberId - 1, result.racing, GameConfig.memberRacingData);

                            this.toConnectSocket({
                                key: GameConfig.channelKey,
                                act: SocketEvent.UPDATE_GAME,
                                gameStatus: "memberAction",
                                racing: GameConfig.memberRacingData,
                                count: null
                            });*/
                            break;
                    }
                }
                break;
            /* ========================================================= */
            /**
             * Websocket斷線時發生
             **/
            case SocketEvent.ON_CLOSE:
                break;
            /* ========================================================= */
            /**
             *  Websocket連接錯誤時發生
             **/
            case SocketEvent.ON_CONNECT_ERROR:
                break;
        }
    };
    GameConfig.prototype.toUpdateChannelStatus = function () {
        this.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.UPDATE_CHANNEL_STATUS,
            channelLocked: GameConfig.isChannelLocked,
            channelMembers: GameUtil.encodeArray(GameConfig.channelMembers),
            deviceWidth: GameUtil.encodeArray(GameConfig.membersDeviceWidth),
            deviceHeight: GameUtil.encodeArray(GameConfig.membersDeviceHeight)
        });
    };
    GameConfig.prototype.toGetTotalMembers = function () {
        var total = 0;
        GameConfig.channelMembers.forEach(function (item) {
            if (+item == 1) {
                total += 1;
            }
        });
        return total;
    };
    GameConfig.channelKey = "";
    GameConfig.channelMembers = [0, 0, 0, 0];
    GameConfig.membersDeviceWidth = [0, 0, 0, 0];
    GameConfig.membersDeviceHeight = [0, 0, 0, 0];
    GameConfig.membersRacingIndex = [0, 0, 0, 0];
    return GameConfig;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2016/1/5.
 */
var Util;
(function (Util) {
    function toGetParam(key, casesensitive) {
        if (casesensitive === void 0) { casesensitive = false; }
        var name = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var url = window.location.href;
        if (!casesensitive)
            name = name.toLowerCase();
        if (!casesensitive)
            url = url.toLowerCase();
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null) {
            return "";
        }
        else {
            return results[1];
        }
    }
    Util.toGetParam = toGetParam;
})(Util || (Util = {}));
/**
 * Created by susanph.huang on 2016/1/4.
 */
/// <reference path="../definition/jquery/jquery.d.ts"/>
/// <reference path="../definition/greensock/greensock.d.ts" />
var LoadingUI = (function () {
    function LoadingUI(name) {
        this.$self = $("#" + name);
        this.$self.css({
            "display": "none",
            "opacity": 0
        });
        $(window).resize(this.onResize.bind(this));
        this.toCreateElements();
    }
    LoadingUI.prototype.toRemoved = function () {
        this.$self.unbind();
        TweenMax.killChildTweensOf(this.$self);
    };
    LoadingUI.prototype.onResize = function (event) {
    };
    LoadingUI.prototype.toCreateElements = function () {
        this.onResize(null);
        this.toTransitionIn();
    };
    LoadingUI.prototype.onProgress = function (progress) {
        console.clear();
        console.log("progress:" + progress);
    };
    LoadingUI.prototype.toTransitionIn = function () {
        this.$self.css("display", "block");
        TweenMax.to(this.$self, 0.3, {
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    LoadingUI.prototype.toTransitionOut = function () {
        TweenMax.to(this.$self, 0.5, {
            delay: 0.5,
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE"]
        });
    };
    LoadingUI.prototype.onTransitionComplete = function (type) {
        if (type == "TRANSITION_IN_COMPLETE") {
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.$self.css({
                "display": "none",
                "opacity": 0
            });
        }
    };
    return LoadingUI;
})();
/**
 * Created by susanph.huang on 2015/10/27.
 */
var ViewEvent;
(function (ViewEvent) {
    ViewEvent.TRANSITION_IN = "TransitionIn";
    ViewEvent.TRANSITION_OUT = "TransitionOut";
    ViewEvent.TRANSITION_IN_COMPLETE = "TransitionInComplete";
    ViewEvent.TRANSITION_OUT_COMPLETE = "TransitionOutComplete";
})(ViewEvent || (ViewEvent = {}));
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../../definition/jquery/jquery.d.ts" />
/// <reference path="../../definition/greensock/greensock.d.ts" />
/// <reference path="../events/ViewEvent.ts"/>
var AbstractStep = (function () {
    function AbstractStep(name) {
        this.stepId = -1;
        this.$self = $("." + name);
        this.$self.css({
            "display": "none",
            "opacity": 0
        });
        $(window).resize(this.onResize.bind(this));
        this.toCreateElements();
    }
    AbstractStep.prototype.toRemoved = function () {
        this.$self.unbind();
        TweenMax.killChildTweensOf(this.$self);
    };
    AbstractStep.prototype.onResize = function (event) {
    };
    AbstractStep.prototype.toCreateElements = function () {
        this.onResize(null);
        this.toTransitionIn();
    };
    AbstractStep.prototype.toTransitionIn = function () {
        this.$self.css("display", "block");
        TweenMax.to(this.$self, 0.3, {
            delay: 0.5,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractStep.prototype.toTransitionOut = function (stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.to(this.$self, 0.3, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", stepid, pid]
        });
    };
    AbstractStep.prototype.onTransitionComplete = function (type, stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.killChildTweensOf(this.$self);
        if (type == "TRANSITION_IN_COMPLETE") {
            this.$self.trigger(ViewEvent.TRANSITION_IN_COMPLETE);
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.$self.css("display", "none");
            this.$self.trigger(ViewEvent.TRANSITION_OUT_COMPLETE, [stepid, pid]);
        }
    };
    return AbstractStep;
})();
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../../definition/jquery/jquery.d.ts" />
/// <reference path="../../definition/greensock/greensock.d.ts" />
/// <reference path="../events/ViewEvent.ts"/>
/// <reference path="../abstract/AbstractStep.ts"/>
var AbstractView = (function () {
    function AbstractView(name, resource, id, stepid) {
        if (id === void 0) { id = 0; }
        if (stepid === void 0) { stepid = 0; }
        this.id = -1;
        this.stepId = -1;
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
    AbstractView.prototype.toRemoved = function () {
        this.$self.unbind();
        TweenMax.killChildTweensOf(this.$self);
    };
    AbstractView.prototype.onResize = function (event) {
    };
    AbstractView.prototype.toCreateElements = function () {
        this.onResize(null);
        this.toTransitionIn();
    };
    AbstractView.prototype.toCreateStep = function (id) {
    };
    AbstractView.prototype.toTransitionIn = function () {
        this.$self.css("display", "block");
        TweenMax.to(this.$self, 0.3, {
            delay: 0.5,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractView.prototype.toTransitionOut = function (id, stepid) {
        if (id === void 0) { id = -1; }
        if (stepid === void 0) { stepid = -1; }
        if (this.stepView) {
            if (id == this.id) {
                this.stepView.toTransitionOut(stepid, -1);
            }
            else {
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
    };
    AbstractView.prototype.onTransitionComplete = function (type, id, stepid) {
        if (type == "TRANSITION_IN_COMPLETE") {
            this.toCreateStep(this.stepId);
            this.$self.trigger(ViewEvent.TRANSITION_IN_COMPLETE);
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.$self.css("display", "none");
            this.$self.trigger(ViewEvent.TRANSITION_OUT_COMPLETE, [id, stepid]);
        }
    };
    return AbstractView;
})();
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
var HomeStep1 = (function (_super) {
    __extends(HomeStep1, _super);
    function HomeStep1(name) {
        _super.call(this, name);
    }
    HomeStep1.prototype.toCreateElements = function () {
        this.startBtn = this.$self.find(".startBtn");
        this.startBtn.bind("click tap", this.onStartBtnStatus.bind(this));
        _super.prototype.toCreateElements.call(this);
    };
    HomeStep1.prototype.onStartBtnStatus = function (event) {
        if (event.currentTarget.className == "startBtn") {
            this.toTransitionOut(0, 1);
        }
    };
    return HomeStep1;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="home/HomeStep1.ts"/>
var HomeView = (function (_super) {
    __extends(HomeView, _super);
    function HomeView(name, resource, id, stepid) {
        _super.call(this, name, resource, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "homeStep1", className: HomeStep1 }
        ];
    }
    HomeView.prototype.toCreateStep = function (id) {
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"]);
        this.stepView.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
    };
    HomeView.prototype.onStepViewStatus = function (event, stepid, pid) {
        event.stopPropagation();
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.stepView = null;
            if (pid == -1) {
                this.toCreateStep(stepid);
            }
            else {
                App.pixiView.toTransitionOut(pid, stepid);
                this.toTransitionOut(pid, stepid);
            }
        }
    };
    return HomeView;
})(AbstractView);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
var ChannelStep1 = (function (_super) {
    __extends(ChannelStep1, _super);
    function ChannelStep1(name) {
        _super.call(this, name);
    }
    ChannelStep1.prototype.toCreateElements = function () {
        this.singleBtn = this.$self.find(".singleBtn");
        this.singleBtn.bind("click tap", this.onBtnStatus.bind(this));
        this.multiBtn = this.$self.find(".multiBtn");
        this.multiBtn.bind("click tap", this.onBtnStatus.bind(this));
        _super.prototype.toCreateElements.call(this);
    };
    ChannelStep1.prototype.onBtnStatus = function (event) {
        if (event.currentTarget.className == "singleBtn") {
            GameConfig.gameType = "SingleGame";
            this.toTransitionOut(0, 0);
        }
        if (event.currentTarget.className == "multiBtn") {
            GameConfig.gameType = "MultiGame";
            App.gameConfig.toInitSocket();
        }
    };
    return ChannelStep1;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/1/26.
 */
var GameUtil;
(function (GameUtil) {
    /* COUNTDOWN */
    /*    export class CountDown extends PIXI.Container {

     private ticker:any;
     private repeat:number;
     private count:number;

     constructor(repeat:number = 1) {
     super();
     this.repeat = repeat;
     this.toCreateElement(repeat);
     }

     private toCreateElement(repeat:number):void {

     this.count = 0;
     this.ticker = setInterval(()=> {
     if (this.count <= this.repeat) {

     this.emit(GameEvent.ON_COUNTDOWN, {
     count: this.count + 1,
     type: GameEvent.ON_COUNTDOWN
     });

     this.count++;

     } else {
     this.toStop();
     }

     }, 1000)
     }

     public toReset():void {
     this.toStop();
     this.toCreateElement(this.repeat);
     }

     public toStop():void {
     window.clearInterval(this.ticker);
     this.ticker = null;
     }
     }*/
    /* COUNTDOWN End */
    /* TOOLS */
    function toCreateGameKey() {
        var key = ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }
    GameUtil.toCreateGameKey = toCreateGameKey;
    function encodeArray(arr) {
        var encodeStr = "";
        arr.forEach(function (item) {
            encodeStr = encodeStr + item.toString() + "|";
        });
        return encodeStr.slice(0, -1);
    }
    GameUtil.encodeArray = encodeArray;
    function decodeStr(str, arg) {
        var tmpArr = [];
        str.split(arg).forEach(function (item) {
            tmpArr.push(+item);
        });
        return tmpArr;
    }
    GameUtil.decodeStr = decodeStr;
})(GameUtil || (GameUtil = {}));
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>
var ChannelStep2 = (function (_super) {
    __extends(ChannelStep2, _super);
    function ChannelStep2(name) {
        _super.call(this, name);
    }
    ChannelStep2.prototype.toCreateElements = function () {
        this.leaderBtn = this.$self.find(".leaderBtn");
        this.leaderBtn.bind("click tap", this.onBtnStatus.bind(this));
        this.memberBtn = this.$self.find(".memberBtn");
        this.memberBtn.bind("click tap", this.onBtnStatus.bind(this));
        _super.prototype.toCreateElements.call(this);
    };
    ChannelStep2.prototype.onBtnStatus = function (event) {
        if (event.currentTarget.className == "leaderBtn") {
            GameConfig.gameActor = "LEADER";
            GameConfig.channelKey = GameUtil.toCreateGameKey();
            var deviceArr = [Config.stageWidth, Config.stageHeight];
            console.log(GameUtil.encodeArray(deviceArr));
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.JOIN_CHANNEL,
                device: GameUtil.encodeArray(deviceArr)
            });
        }
        if (event.currentTarget.className == "memberBtn") {
            GameConfig.gameActor = "MEMBER";
            this.toTransitionOut(2, -1);
        }
    };
    return ChannelStep2;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>
var ChannelStep3 = (function (_super) {
    __extends(ChannelStep3, _super);
    function ChannelStep3(name) {
        _super.call(this, name);
    }
    ChannelStep3.prototype.toCreateElements = function () {
        this.keyText = this.$self.find(".keyText");
        this.keyText.html(GameConfig.channelKey.toString().toUpperCase());
        this.totalText = this.$self.find(".totalText");
        this.totalText.html(GameConfig.totalMembers.toString());
        this.lockBtn = this.$self.find(".lockBtn");
        this.lockBtn.bind("click tap", this.onBtnStatus.bind(this));
        this.toUpdate();
        _super.prototype.toCreateElements.call(this);
    };
    ChannelStep3.prototype.onBtnStatus = function (event) {
        if (event.currentTarget.className == "lockBtn") {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.LOCK_CHANNEL
            });
        }
    };
    ChannelStep3.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
        this.totalText.html(GameConfig.totalMembers.toString());
    };
    return ChannelStep3;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>
var ChannelStep4 = (function (_super) {
    __extends(ChannelStep4, _super);
    function ChannelStep4(name) {
        _super.call(this, name);
    }
    ChannelStep4.prototype.toCreateElements = function () {
        this.keyText = this.$self.find(".keyText");
        this.keyText.html(GameConfig.channelKey.toString().toUpperCase());
        this.totalText = this.$self.find(".totalText");
        this.totalText.html(GameConfig.totalMembers.toString());
        this.lockBtn = this.$self.find(".lockBtn");
        this.lockBtn.bind("click tap", this.onBtnStatus.bind(this));
        this.toUpdate();
        _super.prototype.toCreateElements.call(this);
    };
    ChannelStep4.prototype.onBtnStatus = function (event) {
        if (event.currentTarget.className == "lockBtn") {
            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.LOCK_CHANNEL
            });
        }
    };
    ChannelStep4.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
        this.totalText.html(GameConfig.totalMembers.toString());
    };
    return ChannelStep4;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>
var ChannelStep5 = (function (_super) {
    __extends(ChannelStep5, _super);
    function ChannelStep5(name) {
        _super.call(this, name);
    }
    ChannelStep5.prototype.toCreateElements = function () {
        this.playBtn = this.$self.find(".playBtn");
        this.playBtn.bind("click tap", this.onBtnStatus.bind(this));
        _super.prototype.toCreateElements.call(this);
    };
    ChannelStep5.prototype.onBtnStatus = function (event) {
        if (event.currentTarget.className == "playBtn") {
            console.log("totalMembers:" + GameConfig.totalMembers);
            if (GameConfig.totalMembers > 1) {
                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    memberId: GameConfig.gameId,
                    act: SocketEvent.UPDATE_GAME,
                    gameStatus: "toStandBy"
                });
            }
            else {
                GameConfig.gameType = "SingleGame";
                this.toTransitionOut(0, 3);
            }
        }
    };
    return ChannelStep5;
})(AbstractStep);
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>
/// <reference path="channel/ChannelStep2.ts"/>
/// <reference path="channel/ChannelStep3.ts"/>
/// <reference path="channel/ChannelStep4.ts"/>
/// <reference path="channel/ChannelStep5.ts"/>
var ChannelView = (function (_super) {
    __extends(ChannelView, _super);
    function ChannelView(name, resource, id, stepid) {
        _super.call(this, name, resource, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "channelStep1", className: ChannelStep1 },
            { name: "channelStep2", className: ChannelStep2 },
            { name: "channelStep3", className: ChannelStep3 },
            { name: "channelStep4", className: ChannelStep4 },
            { name: "channelStep5", className: ChannelStep5 }
        ];
    }
    ChannelView.prototype.toCreateStep = function (id) {
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"]);
        this.stepView.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
    };
    ChannelView.prototype.onStepViewStatus = function (event, stepid, pid) {
        event.stopPropagation();
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.stepView = null;
            if (pid == -1) {
                this.toCreateStep(stepid);
            }
            else {
                App.pixiView.toTransitionOut(pid, stepid);
                this.toTransitionOut(pid, stepid);
            }
        }
    };
    return ChannelView;
})(AbstractView);
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>
var WaitView = (function (_super) {
    __extends(WaitView, _super);
    function WaitView(name, resource, id, stepid) {
        _super.call(this, name, resource, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "waitStep1", className: ChannelStep1 }
        ];
    }
    WaitView.prototype.toCreateStep = function (id) {
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"]);
        this.stepView.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
    };
    WaitView.prototype.onStepViewStatus = function (event, stepid, pid) {
        event.stopPropagation();
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.stepView = null;
            if (pid == -1) {
                this.toCreateStep(stepid);
            }
            else {
                App.pixiView.toTransitionOut(pid, stepid);
                this.toTransitionOut(pid, stepid);
            }
        }
    };
    return WaitView;
})(AbstractView);
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>
var GameView = (function (_super) {
    __extends(GameView, _super);
    function GameView(name, resource, id, stepid) {
        _super.call(this, name, resource, id, stepid);
    }
    GameView.prototype.toCreateElements = function () {
        console.log("GameView.toCreateElements");
        _super.prototype.toCreateElements.call(this);
    };
    return GameView;
})(AbstractView);
/**
 * Created by susanph.huang on 2016/2/22.
 */
/// <reference path="../abstract/AbstractView.ts"/>
/// <reference path="channel/ChannelStep1.ts"/>
var ResultView = (function (_super) {
    __extends(ResultView, _super);
    function ResultView(name, resource, id, stepid) {
        _super.call(this, name, resource, id, stepid);
    }
    ResultView.prototype.toCreateElements = function () {
        console.log("ResultView.toCreateElements");
        _super.prototype.toCreateElements.call(this);
    };
    return ResultView;
})(AbstractView);
/**
 * Created by susanph.huang on 2015/12/3.
 */
/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>
var AbstractPixiStep = (function (_super) {
    __extends(AbstractPixiStep, _super);
    function AbstractPixiStep(name, resourses) {
        _super.call(this);
        this.name = name;
        this.resources = resourses;
        this.alpha = 0;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    AbstractPixiStep.prototype.onResize = function (event) {
    };
    AbstractPixiStep.prototype.toInit = function () {
        this.toCreateElements();
    };
    AbstractPixiStep.prototype.toCreateElements = function () {
        this.toTransitionIn();
    };
    AbstractPixiStep.prototype.toRemove = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (item) {
                _this.removeChild(item);
                item = null;
            });
        }
    };
    AbstractPixiStep.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
    };
    AbstractPixiStep.prototype.toTransitionIn = function () {
        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractPixiStep.prototype.toTransitionOut = function (stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", stepid, pid]
        });
    };
    AbstractPixiStep.prototype.onTransitionComplete = function (type, stepid, pid) {
        if (stepid === void 0) { stepid = -1; }
        if (pid === void 0) { pid = -1; }
        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {
            this.toUpdate();
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                stepid: stepid,
                pid: pid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            });
        }
    };
    return AbstractPixiStep;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/3.
 */
/// <reference path="../../definition/greensock/greensock.d.ts"/>
/// <reference path="../../definition/jquery/jquery.d.ts"/>
/// <reference path="../events/ViewEvent.ts"/>
/// <reference path="AbstractPixiStep.ts"/>
var AbstractPixiView = (function (_super) {
    __extends(AbstractPixiView, _super);
    function AbstractPixiView(name, resourses, id, stepid) {
        if (id === void 0) { id = 0; }
        if (stepid === void 0) { stepid = 0; }
        _super.call(this);
        this.name = name;
        this.resources = resourses;
        this.alpha = 0;
        this.id = id;
        this.stepId = stepid;
        $(window).resize(this.onResize.bind(this));
        this.toInit();
    }
    AbstractPixiView.prototype.onResize = function (event) {
    };
    AbstractPixiView.prototype.toInit = function () {
        this.toCreateElements();
    };
    AbstractPixiView.prototype.toCreateElements = function () {
        this.toCreateBg();
        this.toTransitionIn();
    };
    AbstractPixiView.prototype.toCreateBg = function () {
        var bg = new PIXI.Sprite(this.resources[this.name + "_bg"].texture);
        bg.scale.x = bg.scale.y = Config.scaleRate;
        bg.x = (window.innerWidth - bg.width) * 0.5;
        bg.y = (window.innerHeight - bg.height) * 0.5;
        this.addChildAt(bg, 0);
    };
    AbstractPixiView.prototype.toRemove = function () {
        var _this = this;
        if (this.children.length > 0) {
            this.children.forEach(function (item) {
                _this.removeChild(item);
                item = null;
            });
        }
    };
    AbstractPixiView.prototype.toUpdate = function () {
        requestAnimationFrame(this.toUpdate.bind(this));
    };
    AbstractPixiView.prototype.toCreateStep = function (id) {
    };
    AbstractPixiView.prototype.toTransitionIn = function () {
        TweenMax.to(this, 0.5, {
            delay: 0.3,
            alpha: 1,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_IN_COMPLETE"]
        });
    };
    AbstractPixiView.prototype.toTransitionOut = function (pid, stepid) {
        if (pid === void 0) { pid = -1; }
        if (stepid === void 0) { stepid = -1; }
        if (this.stepView) {
            if (pid == this.id) {
                this.stepView.toTransitionOut(stepid, -1);
            }
            else {
                this.stepView.toTransitionOut(stepid, pid);
            }
            return;
        }
        TweenMax.to(this, 0.5, {
            alpha: 0,
            ease: Quart.easeOut,
            onComplete: this.onTransitionComplete.bind(this),
            onCompleteParams: ["TRANSITION_OUT_COMPLETE", pid, stepid]
        });
    };
    AbstractPixiView.prototype.onTransitionComplete = function (type, pid, stepid) {
        if (pid === void 0) { pid = -1; }
        if (stepid === void 0) { stepid = -1; }
        TweenMax.killTweensOf(this);
        if (type == "TRANSITION_IN_COMPLETE") {
            this.toUpdate();
            this.toCreateStep(this.stepId);
            this.emit(ViewEvent.TRANSITION_IN_COMPLETE, {
                type: ViewEvent.TRANSITION_IN_COMPLETE
            });
        }
        if (type == "TRANSITION_OUT_COMPLETE") {
            this.toRemove();
            this.emit(ViewEvent.TRANSITION_OUT_COMPLETE, {
                id: pid,
                stepid: stepid,
                type: ViewEvent.TRANSITION_OUT_COMPLETE
            });
        }
    };
    return AbstractPixiView;
})(PIXI.Container);
/**
 * Created by susanph.huang on 2015/12/31.
 */
var CreateUtil;
(function (CreateUtil) {
    function toCreateCustomBtn(txt) {
        var shape = new PIXI.Graphics();
        var text = new PIXI.Text(txt, { font: '20px Arial', fill: 0xffffff, align: 'center' });
        text.x = 15;
        text.y = 10;
        shape.beginFill(0x6c6c6c, 1);
        shape.drawRect(0, 0, text.width + 30, text.height + 20);
        shape.endFill();
        shape.addChild(text);
        return shape;
    }
    CreateUtil.toCreateCustomBtn = toCreateCustomBtn;
    function toGetSpSheetTexture(name, textures) {
        var texture;
        for (var key in textures) {
            if (key === name) {
                texture = PIXI.Texture.fromFrame(key);
            }
        }
        return texture;
    }
    CreateUtil.toGetSpSheetTexture = toGetSpSheetTexture;
    function toCreateMovieClip(textures) {
        var textureArr = [];
        for (var key in textures) {
            var texture = PIXI.Texture.fromFrame(key);
            textureArr.push(texture);
        }
        var mc = new PIXI.extras.MovieClip(textureArr);
        return mc;
    }
    CreateUtil.toCreateMovieClip = toCreateMovieClip;
    function toActivateItem(target, callback) {
        target.buttonMode = true;
        target.interactive = true;
        target.on('mousedown', callback)
            .on('touchstart', callback);
    }
    CreateUtil.toActivateItem = toActivateItem;
    function toAlignItem(item, horizontal, vertical) {
        if (horizontal === void 0) { horizontal = "LEFT"; }
        if (vertical === void 0) { vertical = "TOP"; }
        if (horizontal == "LEFT") {
            item.x = 0;
        }
        else if (horizontal == "CENTER") {
            item.x = (Config.stageWidth - item.width) * 0.5;
        }
        else if (horizontal == "RIGHT") {
            item.x = (Config.stageWidth - item.width);
        }
        if (vertical == "TOP") {
            item.y = 0;
        }
        else if (vertical == "CENTER") {
            item.y = (Config.stageHeight - item.height) * 0.5;
        }
        else if (vertical == "BOTTOM") {
            item.y = (Config.stageHeight - item.height);
        }
    }
    CreateUtil.toAlignItem = toAlignItem;
})(CreateUtil || (CreateUtil = {}));
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
var HomePixiView = (function (_super) {
    __extends(HomePixiView, _super);
    function HomePixiView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
    }
    HomePixiView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    HomePixiView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    HomePixiView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    HomePixiView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return HomePixiView;
})(AbstractPixiView);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
var ChannelPixiView = (function (_super) {
    __extends(ChannelPixiView, _super);
    function ChannelPixiView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
    }
    ChannelPixiView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    ChannelPixiView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    ChannelPixiView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    ChannelPixiView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return ChannelPixiView;
})(AbstractPixiView);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
var WaitPixiView = (function (_super) {
    __extends(WaitPixiView, _super);
    function WaitPixiView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
    }
    WaitPixiView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    WaitPixiView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    WaitPixiView.prototype.toCreateElements = function () {
        var carTexture = this.resources["wait_car_" + GameConfig.gameId].texture;
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
        _super.prototype.toCreateElements.call(this);
    };
    WaitPixiView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return WaitPixiView;
})(AbstractPixiView);
/**
 * Created by susanph.huang on 2016/2/24.
 */
var SingleGamePixiStep = (function (_super) {
    __extends(SingleGamePixiStep, _super);
    function SingleGamePixiStep(name, resources) {
        _super.call(this, name, resources);
    }
    return SingleGamePixiStep;
})(AbstractPixiStep);
/**
 * Created by susanph.huang on 2016/2/24.
 */
var MultiGamePixiStep = (function (_super) {
    __extends(MultiGamePixiStep, _super);
    function MultiGamePixiStep(name, resources) {
        _super.call(this, name, resources);
    }
    return MultiGamePixiStep;
})(AbstractPixiStep);
/**
 * Created by susanph.huang on 2015/12/29.
 */
/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
/// <reference path="game/SingleGamePixiStep.ts"/>
/// <reference path="game/MultiGamePixiStep.ts"/>
/// <reference path="../service/SocketConnector.ts"/>
var GamePixiView = (function (_super) {
    __extends(GamePixiView, _super);
    function GamePixiView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
        /**
         * Step
         * */
        this.stepData = [
            { name: "singleGamePixiStep", className: SingleGamePixiStep },
            { name: "multiGamePixiStep", className: MultiGamePixiStep }
        ];
    }
    GamePixiView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    GamePixiView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    GamePixiView.prototype.toCreateElements = function () {
        _super.prototype.toCreateElements.call(this);
    };
    GamePixiView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    GamePixiView.prototype.toCreateStepView = function (id) {
        if (this.stepView) {
            this.stepView.toTransitionOut(id);
            return;
        }
        this.stepId = id;
        var StepClass = this.stepData[id]["className"];
        this.stepView = new StepClass(this.stepData[id]["name"], this.resources);
        this.stepView.once(ViewEvent.TRANSITION_IN_COMPLETE, this.onStepViewStatus.bind(this));
        this.stepView.once(ViewEvent.TRANSITION_OUT_COMPLETE, this.onStepViewStatus.bind(this));
        this.addChild(this.stepView);
    };
    GamePixiView.prototype.onStepViewStatus = function (event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            this.removeChild(this.stepView);
            this.stepView.destroy();
            this.stepView = null;
            if (event.pid == -1) {
                this.toCreateStepView(event.stepid);
            }
            else {
                this.toTransitionOut(event.pid, event.stepid);
            }
        }
    };
    return GamePixiView;
})(AbstractPixiView);
/**
 * Created by susanph.huang on 2016/2/23.
 */
/// <reference path="../abstract/AbstractPixiView.ts"/>
/// <reference path="../abstract/AbstractPixiStep.ts"/>
/// <reference path="../utils/CreateUtil.ts"/>
var ResultPixiView = (function (_super) {
    __extends(ResultPixiView, _super);
    function ResultPixiView(name, resources, id, stepid) {
        _super.call(this, name, resources, id, stepid);
    }
    ResultPixiView.prototype.toRemove = function () {
        _super.prototype.toRemove.call(this);
    };
    ResultPixiView.prototype.onResize = function (event) {
        _super.prototype.onResize.call(this, event);
    };
    ResultPixiView.prototype.toCreateElements = function () {
        console.log("ResultPixiView.toCreateElements");
        _super.prototype.toCreateElements.call(this);
    };
    ResultPixiView.prototype.toUpdate = function () {
        _super.prototype.toUpdate.call(this);
    };
    return ResultPixiView;
})(AbstractPixiView);
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
var App;
(function (App) {
    $(document).ready(function () {
        Config.setConfig();
        Config.defaultHeight = $("#navCon").height();
        toCrateGamePlayer();
    });
    /**
     * 一開始判斷URL有無帶Key參數，若有就是MEMBER
     * */
    function toCheckUrl() {
        GameConfig.channelKey = Util.toGetParam("key");
        if (GameConfig.channelKey == "" || /[A-Za-z0-9]{8}/.test(GameConfig.channelKey) == false) {
            toCreateView(viewId);
            toCreatePixiView(viewId);
        }
        else {
            GameConfig.gameActor = "MEMBER";
            App.gameConfig.toInitSocket();
        }
    }
    /**
     * PIXI GAME
     * */
    var gameScene;
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
    function toCreateLoadingUI() {
        App.loadingUI = new LoadingUI("preLoading");
    }
    function toLoadResConfig() {
        App.RES = GameRes.instance();
        App.RES.on(ResourceEvent.CONFIG_COMPLETE, onResConfigComplete);
        App.RES.toLoadConfig("resource/resource.json", "resConfig");
    }
    function onResConfigComplete() {
        App.RES.on(ResourceEvent.GROUP_PROGRESS, onResGroupProgress);
        App.RES.on(ResourceEvent.GROUP_COMPLETE, onResGroupComplete);
        App.RES.toQueueGroups("home_assets", 0);
        App.RES.toQueueGroups("channel_assets", 1);
        App.RES.toQueueGroups("wait_assets", 2);
        App.RES.toQueueGroups("game_assets", 3);
        App.RES.toQueueGroups("result_assets", 4);
        App.RES.toLoadGroup();
    }
    function onResGroupProgress(progress) {
        //console.log("progress:" + progress);
        App.loadingUI.onProgress(progress);
    }
    function onResGroupComplete(complete) {
        if (complete == "nav_assets") {
        }
        if (complete == "result_assets") {
            App.loadingUI.toTransitionOut();
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
    var viewData = [
        { name: "home", h5Class: HomeView, pixiClass: HomePixiView, isLoaded: false },
        { name: "channel", h5Class: ChannelView, pixiClass: ChannelPixiView, isLoaded: false },
        { name: "wait", h5Class: WaitView, pixiClass: WaitPixiView, isLoaded: false },
        { name: "game", h5Class: GameView, pixiClass: GamePixiView, isLoaded: false },
        { name: "result", h5Class: ResultView, pixiClass: ResultPixiView, isLoaded: false }
    ];
    var viewId = 0;
    var h5View;
    function toCreateView(id, stepid) {
        if (stepid === void 0) { stepid = 0; }
        if (h5View != null) {
            h5View.toTransitionOut(id, stepid);
            return;
        }
        viewId = id;
        var viewResource = App.RES.toGetRes(viewData[id]["name"] + "_assets");
        var H5Class = viewData[id]["h5Class"];
        h5View = new H5Class(viewData[id]["name"], viewResource, id, stepid);
        h5View.$self.on(ViewEvent.TRANSITION_IN_COMPLETE, onH5ViewStatus);
        h5View.$self.on(ViewEvent.TRANSITION_OUT_COMPLETE, onH5ViewStatus);
    }
    function onH5ViewStatus(event, id, stepid) {
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
    function toCreatePixiView(id, stepid) {
        if (stepid === void 0) { stepid = 0; }
        if (App.pixiView != null) {
            App.pixiView.toTransitionOut(id, stepid);
            return;
        }
        var viewResource = App.RES.toGetRes(viewData[id]["name"] + "_assets");
        var PixiClass = viewData[id]["pixiClass"];
        App.pixiView = new PixiClass(viewData[id]["name"], viewResource, id, stepid);
        App.pixiView.once(ViewEvent.TRANSITION_IN_COMPLETE, onPixiViewStatus);
        App.pixiView.once(ViewEvent.TRANSITION_OUT_COMPLETE, onPixiViewStatus);
        gameScene.addChildAt(App.pixiView, 0);
    }
    function onPixiViewStatus(event) {
        if (event.type == ViewEvent.TRANSITION_IN_COMPLETE) {
        }
        if (event.type == ViewEvent.TRANSITION_OUT_COMPLETE) {
            gameScene.removeChild(App.pixiView);
            App.pixiView.destroy();
            App.pixiView = null;
            if (App.pixiView == null) {
                console.log("pixiView is KILLED");
            }
            toCreatePixiView(event.id, event.stepid);
        }
    }
    function toInitGameConfig() {
        App.gameConfig = GameConfig.instance();
        App.gameConfig.toInit();
        App.gameConfig.on(GameEvent.ON_SERVER_CONNECTED, onGameConfigStatus);
        App.gameConfig.on(GameEvent.ON_CHANNEL_STATUS, onGameConfigStatus);
        App.gameConfig.on(GameEvent.CHANNEL_LOCKED, onGameConfigStatus);
        App.gameConfig.on(GameEvent.ON_GAME_UPDATE, onGameConfigStatus);
    }
    function onGameConfigStatus(event) {
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
                    var deviceArr = [Config.stageWidth, Config.stageHeight];
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
})(App || (App = {}));
