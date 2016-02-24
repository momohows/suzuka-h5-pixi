/**
 * Created by susanph.huang on 2016/1/26.
 */


module GameUtil {

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
    export function toCreateGameKey():string {

        var key:string =
            ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
            + ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
        return key;
    }


    export function encodeArray(arr:Array<any>):string {

        var encodeStr:string = "";
        arr.forEach(item=> {
            encodeStr = encodeStr + item.toString() + "|";
        });

        return encodeStr.slice(0, -1);
    }

    export function decodeStr(str:string, arg:string):Array<any> {

        var tmpArr:Array<number> = [];
        str.split(arg).forEach(item=> {
            tmpArr.push(+item);
        });

        return tmpArr;
    }


}