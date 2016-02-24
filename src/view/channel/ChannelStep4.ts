/**
 * Created by susanph.huang on 2016/2/23.
 */

/// <reference path="../../abstract/AbstractStep.ts"/>
/// <reference path="../../utils/GameUtil.ts"/>

class ChannelStep4 extends AbstractStep {

    private lockBtn:JQuery;
    private keyText:JQuery;
    private totalText:JQuery;

    constructor(name:string) {

        super(name);
    }


    public toCreateElements():void {

        this.keyText = this.$self.find(".keyText");
        this.keyText.html(GameConfig.channelKey.toString().toUpperCase());

        this.totalText = this.$self.find(".totalText");
        this.totalText.html(GameConfig.totalMembers.toString());

        this.lockBtn = this.$self.find(".lockBtn");
        this.lockBtn.bind("click tap", this.onBtnStatus.bind(this));
        this.toUpdate();

        super.toCreateElements();
    }


    private onBtnStatus(event:any):void {

        if (event.currentTarget.className == "lockBtn") {

            App.gameConfig.toConnectSocket({
                key: GameConfig.channelKey,
                act: SocketEvent.LOCK_CHANNEL,
            });
        }
    }

    private toUpdate():void {

        requestAnimationFrame(this.toUpdate.bind(this));
        this.totalText.html(GameConfig.totalMembers.toString());
    }

}

