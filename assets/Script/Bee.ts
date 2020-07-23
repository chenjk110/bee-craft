const { ccclass } = cc._decorator

@ccclass
export default class Bee extends cc.Component {

  public speed = 10

  public isFlying = false

  static EventType = {
    HIT_CRAFT: '__HIT_CRAFT__',
    HIT_BULLET: '__HIT_BULLET__',
  }

  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    if (other.node.group === 'Bullet') {
      this.isFlying = false
      this.node.emit(Bee.EventType.HIT_BULLET, other, self)
    }
    else if (other.node.group === 'Craft') {
      this.isFlying = false
      this.node.emit(Bee.EventType.HIT_CRAFT, other, self)
    }
  }

  update() {
    if (this.isFlying) {
      this.node.y -= this.speed
    }
  }
}
