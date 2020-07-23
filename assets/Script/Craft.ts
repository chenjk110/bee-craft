const { ccclass, property } = cc._decorator;

@ccclass
export default class Craft extends cc.Component {
  static EventType = {
    SHOT: '__SHOT__'
  }

  @property({
    type: cc.AudioSource
  })
  shotAudioSource: cc.AudioSource = null

  public speed = 10
  public shotInterval = 8
  public invincible = false

  private isTouched = false
  private _shotIntervalMark = 0;
  private moveBound = {
    xMax: 0,
    xMin: 0,
    yMax: 0,
    yMin: 0,
  }

  private shotFxId: number = undefined

  private keyPressedMap: Record<cc.macro.KEY, boolean> = {
    [cc.macro.KEY.left]: false,
    [cc.macro.KEY.right]: false,
    [cc.macro.KEY.up]: false,
    [cc.macro.KEY.down]: false,
    // [cc.macro.KEY.space]: false,
  }

  onLoad() {

    this.initTouchMoving();

    this.initKeyPressMoving();

    this.initBoundSize();

    // this.shotFxId = cc.audioEngine.playEffect(this.shotAudioSource.clip, true)
    
  }

  onDestroy() {
    // cc.audioEngine.stopEffect(this.shotFxId)
  }

  // onCollisionStart(other: cc.Collider, self: cc.Collider) {
  //   if (other.node.group === 'Bound') {
  //   }
  // }

  // store moveBound value
  private initBoundSize() {
    this.moveBound.xMin = -this.node.parent.width / 2 + this.node.width / 2
    this.moveBound.xMax = this.node.parent.width / 2 - this.node.width / 2
    this.moveBound.yMin = -this.node.parent.height / 2 + this.node.height / 2
    this.moveBound.yMax = this.node.parent.height / 2 - this.node.height / 2

  }

  private initTouchMoving() {
    const {
      TOUCH_MOVE,
      TOUCH_END,
      TOUCH_START,
      TOUCH_CANCEL,
    } = cc.Node.EventType

    const handleMove = (event: cc.Touch) => {
      if (this.isTouched) {
        const delta = event.getDelta()
        this.move(delta.x, delta.y)
      }
    }
    const handleStart = () => this.isTouched = true
    const handleEnd = () => this.isTouched = false

    this.node.on(TOUCH_START, handleStart)
    this.node.on(TOUCH_END, handleEnd)
    this.node.on(TOUCH_CANCEL, handleEnd)
    this.node.on(TOUCH_MOVE, handleMove)
  }

  private initKeyPressMoving() {
    const { KEY_DOWN, KEY_UP } = cc.SystemEvent.EventType

    const changeKeyPressStatus = (keyCode: cc.macro.KEY, flag: boolean) => {
      this.keyPressedMap[keyCode] = flag
    }

    cc.systemEvent.on(KEY_DOWN, (event: any) => {
      changeKeyPressStatus(event.keyCode, true)
    }, this)

    cc.systemEvent.on(KEY_UP, (event: any) => {
      changeKeyPressStatus(event.keyCode, false)
    }, this)

    cc.systemEvent.on(KEY_DOWN, (event: any) => {
      if (event.keyCode === cc.macro.KEY.space) {
        this.shot()
      }
    }, this)

  }

  private shot() {

    if (this._shotIntervalMark >= this.shotInterval) {
      this._shotIntervalMark = 0
      this.node.emit(Craft.EventType.SHOT, this.node)
    } else {
      this._shotIntervalMark += 1
    }
  }

  private move(diffX = 0, diffY = 0) {
    const { xMax, xMin, yMax, yMin } = this.moveBound

    let x = this.node.x + diffX
    let y = this.node.y + diffY

    x = Math.max(xMin, x)
    x = Math.min(xMax, x)
    y = Math.max(yMin, y)
    y = Math.min(yMax, y)

    this.node.x = x
    this.node.y = y
  }

  private checkForMoving() {
    const { left, right, up, down } = cc.macro.KEY
    if (this.keyPressedMap[left]) {
      this.move(-this.speed)
    }
    if (this.keyPressedMap[right]) {
      this.move(this.speed)
    }
    if (this.keyPressedMap[up]) {
      this.move(0, this.speed)
    }
    if (this.keyPressedMap[down]) {
      this.move(0, -this.speed)
    }
  }

  update() {
    /// checking
    this.checkForMoving();

    /// updating
    this.shot();
  }

  public beginBlink(times: number = 10) {

    if (this.invincible) { return }

    this.invincible = true

    const act = cc.sequence(
      cc.blink(2, times),
      cc.callFunc(() => this.invincible = false)
    )

    this.node.runAction(act)
  }
}
