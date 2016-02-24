/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>

class ChannelStep5 extends AbstractStep {

    private playBtn:JQuery;

    constructor(name:string) {

        super(name);
    }


    public toCreateElements():void {

        this.playBtn = this.$self.find(".playBtn");
        this.playBtn.bind("click tap", this.onBtnStatus.bind(this));
        super.toCreateElements();
    }


    private onBtnStatus(event:any):void {

        if (event.currentTarget.className == "playBtn") {

            console.log("totalMembers:" + GameConfig.totalMembers);
            if (GameConfig.totalMembers > 1) {

                App.gameConfig.toConnectSocket({
                    key: GameConfig.channelKey,
                    memberId: GameConfig.gameId,
                    act: SocketEvent.UPDATE_GAME,
                    gameStatus: "toStandBy"
                });

            } else {

                GameConfig.gameType = "SingleGame";

                this.toTransitionOut(0, 3);
            }
        }
    }


}

