/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>

class ChannelStep2 extends AbstractStep {

    private leaderBtn:JQuery;
    private memberBtn:JQuery;

    constructor(name:string) {

        super(name);
    }


    public toCreateElements():void {

        this.leaderBtn = this.$self.find(".leaderBtn");
        this.leaderBtn.bind("click tap", this.onBtnStatus.bind(this));

        this.memberBtn = this.$self.find(".memberBtn");
        this.memberBtn.bind("click tap", this.onBtnStatus.bind(this));

        super.toCreateElements();
    }


    private onBtnStatus(event:any):void {

        if (event.currentTarget.className == "leaderBtn") {

            GameConfig.gameActor = "LEADER";
            GameConfig.channelKey = GameUtil.toCreateGameKey();

            var deviceArr:Array<any> = [Config.stageWidth, Config.stageHeight];
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
    }

}

