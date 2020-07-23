import Bullet from "./Bullet"
import Craft from "./Craft"
import Bee from "./Bee"

const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {

  MAX_BEE_COUNTS = 30

  @property(cc.Sprite)
  ButtonBack: cc.Sprite = null

  @property({
    type: cc.Texture2D,
  })
  craftTexture2D: cc.Texture2D = null

  @property({
    type: cc.Texture2D,
  })
  beeTexture2D: cc.Texture2D = null

  @property(cc.Label)
  Score: cc.Label = null

  @property(cc.Layout)
  LifeBar: cc.Layout = null

  @property(Craft)
  craft: Craft = null

  @property(cc.Node)
  beeGroup: cc.Node = null

  @property(cc.Prefab)
  LifeBarItemPrefab: cc.Prefab = null

  @property(cc.Prefab)
  BeePrefab: cc.Prefab = null

  @property(cc.Prefab)
  BulletPrefab: cc.Prefab = null

  @property(cc.Sprite)
  boomSpr: cc.Sprite = null

  private beeNodePool: cc.NodePool = new cc.NodePool()

  private bulletsNodePool: cc.NodePool = new cc.NodePool()

  private lifeSprs: cc.Sprite[] = []

  private life = 3

  onLoad() {

    // init back button tap handler
    this.initButtonBack()

    // init life bar and creating life indicative sprite
    this.initLifeSprs(this.life)

    // 
    this.updateLifeStatus(this.life)

    //
    this.createBeeSpr()

    //
    this.initCraft()

    const collisionMgr = cc.director.getCollisionManager()
    collisionMgr.enabled = true
    // // debug mode
    // collisionMgr.enabledDebugDraw = true
  }

  onCollisionExit(other: cc.Collider) {
    if (other.node.group === 'Bee') {
      this.beeNodePool.put(other.node)
    }
    else if (other.node.group === 'Bullet') {
      this.bulletsNodePool.put(other.node)
    }
  }

  update() {
    if (Math.random() < 0.05) {
      this.createBeeSpr()
    }
  }

  private initCraft() {
    this.craft.node.on(Craft.EventType.SHOT, (node) => {
      this.createBullet(node.x, node.y + node.height / 2);
    })
  }

  private initButtonBack() {

    const {
      TOUCH_START,
      TOUCH_END,
      TOUCH_CANCEL,
    } = cc.Node.EventType

    const createScaleHandler = (scale: number, duration: number, cb?: () => any) => () => {
      cc.tween(this.ButtonBack.node)
        .to(duration, { scale })
        .call(cb)
        .start()
    }

    this.ButtonBack.node.on(TOUCH_START, createScaleHandler(0.8, 0.1))
    this.ButtonBack.node.on(TOUCH_CANCEL, createScaleHandler(1, 0.05))
    this.ButtonBack.node.on(TOUCH_END, createScaleHandler(1, 0.05, () => {
      this.destroy()
      cc.director.loadScene('Main')
    }))
  }

  private initLifeSprs(counts: number) {
    while (counts-- > 0) {
      const spr = this.createLifeSpr()
      this.lifeSprs.push(spr)
      this.LifeBar.node.addChild(spr.node)
    }
  }

  private createBullet(x: number, y: number) {
    let bullet: cc.Node

    if (this.bulletsNodePool.size()) {
      bullet = this.bulletsNodePool.get()
    } else {
      bullet = cc.instantiate(this.BulletPrefab)
    }

    /// init bullet
    bullet.getComponent(Bullet).isFlying = true
    bullet.x = x
    bullet.y = y

    /// attach bullet
    this.node.addChild(bullet)
  }

  private createLifeSpr() {
    return cc
      .instantiate(this.LifeBarItemPrefab)
      .getComponent(cc.Sprite)
  }

  private createBeeSpr() {
    let bee: cc.Node
    if (this.beeNodePool.size()) {
      bee = this.beeNodePool.get()
    } else {
      bee = cc.instantiate(this.BeePrefab)

      bee.on(Bee.EventType.HIT_CRAFT, (other: cc.Collider, self: cc.Collider) => {
        self.node.parent = null
        this.beeNodePool.put(self.node)
        const craft = other.node.getComponent(Craft)
        if (!craft.invincible) {
          this.handeAwards('life', -1)
          craft.beginBlink()
        }
      })

      /// awarding
      bee.on(Bee.EventType.HIT_BULLET, (other, self) => {

        /// handle bee
        if (cc.isValid(self.node)) {
          this.boomSpr.node.x = other.node.x
          this.boomSpr.node.y = other.node.y

          this.boomSpr.node.scale = 0

          cc.tween(this.boomSpr.node)
            .to(0.1, { scale: 1 })
            .to(0.1, { scale: 0 })
            .start()

          self.node.parent = null
          this.beeNodePool.put(self.node)
        }

        /// handle bullet
        if (cc.isValid(other.node)) {
          other.node.parent = null
          this.bulletsNodePool.put(other.node)
        }

        this.handeAwards('score', 10)
      })

    }

    bee.getComponent(Bee).isFlying = true
    bee.getComponent(Bee).speed = Math.random() * 3 + 1

    bee.x = Math.random() * this.beeGroup.width
    bee.y = 0

    this.beeGroup.addChild(bee)
  }

  private updateLifeStatus(counts: number) {
    this.lifeSprs
      .concat()
      .reverse()
      .forEach((spr, idx, { length }) => {
        const opacity = (length - counts) <= idx
          ? 255
          : 50
        spr.node.opacity = opacity
      })
  }

  private handleGameOver() {
    cc.director.loadScene('GameOver',
      () => this.destroy())
  }

  private handeAwards(type: 'score' | 'life', value: number) {
    if (type === 'score') {
      this.Score.string = (+this.Score.string + value).toString()
    }
    else if (type === 'life') {
      this.life += value
      if (this.life < 0) {
        /// Game Over
        this.handleGameOver()
      } else {
        this.updateLifeStatus(this.life)
      }
    }
  }

}
