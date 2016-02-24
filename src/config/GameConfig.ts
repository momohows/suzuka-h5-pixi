/**
 * Created by susanph.huang on 2016/1/14.
 */
/// <reference path="../service/SocketConnector.ts"/>
/// <reference path="../events/SocketEvent.ts"/>
class GameConfig extends PIXI.Container {

    private static _instance:GameConfig;

    public static gameId:number;
    public static totalMembers:number;
    public static channelKey:string = "";
    public static gameActor:string;
    public static gameType:string;
    public static isWaiting:boolean;
    public static isChannelLocked:boolean;

    public static channelMembers:Array<any> = [0, 0, 0, 0];
    public static membersDeviceWidth:Array<any> = [0, 0, 0, 0];
    public static membersDeviceHeight:Array<any> = [0, 0, 0, 0];
    public static membersRacingIndex:Array<any> = [0, 0, 0, 0];


    private socketConnector:SocketConnector;

    constructor() {
        super();
        if (GameConfig._instance) {
            throw new Error("Error: Please use GameConfig.instance() instead of new.");
        }
    }

    public static instance():GameConfig {
        if (!GameConfig._instance) {
            GameConfig._instance = new GameConfig();
        }
        return GameConfig._instance;
    }


    public toReset():void {

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
    }


    public toInit():void {

        this.toReset();
    }


    public toInitSocket():void {

        if (!this.socketConnector) {

            App.loadingUI.toTransitionIn();
            this.socketConnector = SocketConnector.instance();
            this.socketConnector.toInit();
        }

        this.socketConnector.on(SocketEvent.ON_CONNECT_SUCCESS, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_MESSAGE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CLOSE, this.onSocketStatus.bind(this));
        this.socketConnector.on(SocketEvent.ON_CONNECT_ERROR, this.onSocketStatus.bind(this));
    }


    public toConnectSocket(msg:Object) {
        this.socketConnector.toSendMessage(msg);
    }


    private onSocketStatus(event:any):void {

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

                var result:any = event.data;
                var action:string = result.act;

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
                    /* 正式上線砍掉 */
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

                        var deviceArr:Array<any> = GameUtil.decodeStr(result.device, "|");
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
                    console.log(
                        "==============================="
                        + "\n" + "key:" + GameConfig.channelKey
                        + "\n" + "id:" + GameConfig.gameId
                        + "\n" + "actor:" + GameConfig.gameActor
                        + "\n" + "members:" + GameConfig.channelMembers
                        + "\n" + "total:" + GameConfig.totalMembers
                        + "\n" + "locked:" + GameConfig.isChannelLocked
                        + "\n" + "deviceW:" + GameConfig.membersDeviceWidth
                        + "\n" + "deviceH:" + GameConfig.membersDeviceHeight
                        + "\n" + "==============================="
                    );
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


                    var status:string = result.gameStatus;
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

                    var status:string = result.gameStatus;
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
            /* ========================================================= */
        }

    }


    private toUpdateChannelStatus():void {

        this.toConnectSocket({
            key: GameConfig.channelKey,
            act: SocketEvent.UPDATE_CHANNEL_STATUS,
            channelLocked: GameConfig.isChannelLocked,
            channelMembers: GameUtil.encodeArray(GameConfig.channelMembers),
            deviceWidth: GameUtil.encodeArray(GameConfig.membersDeviceWidth),
            deviceHeight: GameUtil.encodeArray(GameConfig.membersDeviceHeight)
        });
    }


    private toGetTotalMembers():number {

        var total:number = 0;
        GameConfig.channelMembers.forEach(item=> {
            if (+item == 1) {
                total += 1;
            }
        });

        return total;
    }

}