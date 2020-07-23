import { SCENE_NAMES } from '../Utils/consts'

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = '';

    @property(cc.Button)
    buttonPlay: cc.Button = null;

    onLoad() {
        // init logic
        this.label.string = this.text;

        //
        const { TOUCH_END } = cc.Node.EventType
        this.buttonPlay.node.on(TOUCH_END, () => {
            cc.director.loadScene(SCENE_NAMES.Game);
        })
    }
}
