const { ccclass, property } = cc._decorator

@ccclass
export default class GameOver extends cc.Component {

  @property(cc.Button)
  buttonPlay: cc.Button = null

  @property(cc.Label)
  title: cc.Label = null

  onLoad() {
    this.buttonPlay.node.on(cc.Node.EventType.TOUCH_END, () => {
      cc.director.loadScene('Game')
    })
  }
}