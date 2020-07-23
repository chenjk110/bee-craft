const { ccclass } = cc._decorator

@ccclass
export default class Bullet extends cc.Component {
  static EventType = {
    OUT_BOUND: '__OUT_BOUND__',
    HIT_BEE: '__HIT_BEE__'
  }

  public speed = 15

  public isFlying = false

  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    if (other.node.group === 'Bee') {
      this.isFlying = false
      this.node.emit(Bullet.EventType.HIT_BEE, other, self)
    }
  }

  onCollisionExit(other: cc.Collider, self: cc.Collider) {
    if (other.node.group === 'Bound') {
      this.isFlying = false
      this.node.emit(Bullet.EventType.OUT_BOUND, other, self)
    }
  }

  update() {
    if (this.isFlying) {
      this.node.y += this.speed
    }
  }

}
