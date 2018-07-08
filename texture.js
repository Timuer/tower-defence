class AbstractTexture {
    constructor(game, image) {
        this.x = 0
        this.y = 0
        this.width = image.width
        this.height = image.height
        this.game = game
        this.image = image
        this.exists = true
        this.onDebug = true
    }

    draw() {
        this.image.x = this.x
        this.image.y = this.y
        this.game.drawImage(this.image)
    }

    update() {
        if (this.onDebug && this.debug) {
            this.debug()
        }
    }

    center() {
        return new Vector(this.x + this.width / 2, this.y + this.height / 2)
    }
}

class TowerModel extends AbstractTexture {
    constructor(game, image, greyImage, name, x, y) {
        super(game, image)
        this.name = name
        this.towerOffsetX = 0
        this.towerOffsetY = 0
        this.greyImage = greyImage
        this.x = x
        this.y = y
        this.setupConfig()
        this.setupTower()
        this.setupTip()
    }

    setupConfig() {
        this.config = this.game.config["tower"]
    }

    setupTower() {
        this.price = this.config["price"][this.name]
        this.attack = this.config["attack"][this.name]
        this.range = this.config["range"][this.name]
        this.coolDownTime = this.config["coolDownTime"][this.name]
        this.coolDown = new CoolDown(this.coolDownTime)
    }

    setupTip() {
        this.onTip = false
        var tip = new Tip(this.game, this.game.imageByName("tip"))
        tip.x = this.x - tip.width / 2
        tip.y = this.y - tip.height
        this.tip = tip
    }

    createTower() {
        this.coolDown.reset()
        var t = new Tower(this.game, this.image, this.attack, this.range)
        t.x = this.x
        t.y = this.y
        return t
    }

    generateTip() {
        this.onTip = true
    }

    removeTip() {
        this.onTip = false
    }

    isActive() {
        return this.coolDown.isActive() && this.isMoneyEnough()
    }

    isMoneyEnough() {
        var s = this.game.scene
        return s.money.count >= this.price
    }

    updateCoolDown() {
        this.coolDown.update()
    }

    update() {
        super.update()
        this.updateCoolDown()
    }

    draw() {
        this.drawCoolDownBar()
        if (this.onTip) {
            this.drawTip()
        }
    }

    drawCoolDownBar() {
        var x = this.x
        var y = this.y
        var w = this.width
        var h = this.height
        var ctx = this.game.context
        ctx.drawImage(this.greyImage.img, this.x, this.y)
        if (this.isMoneyEnough()) {
            var proportion = this.coolDown.current / this.coolDown.max
            var sx = 0
            var sy = this.image.height * proportion
            var sWidth = this.image.width
            var sHeight = this.image.height * (1 - proportion)
            var dx = this.x
            var dy = this.y + sy
            var dWidth = sWidth
            var dHeight = sHeight
            ctx.drawImage(this.image.img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        }
    }

    drawTip() {
        this.tip.draw()
        var lines = {
            attack: "攻击力：{}",
            range: "攻击范围：{}",
            coolDownTime: "冷却时间: {}",
            price: "价格：{}",
        }
        var keys = Object.keys(lines)
        var ctx = this.game.context
        ctx.font = "15px sans-serif"
        ctx.fillStyle = "RGBA(225, 225, 255, 0.7)"
        var offsetX = 20
        var offsetY = 40
        var x = this.x - this.tip.width / 2 + offsetX
        var y = this.y - this.tip.height + offsetY
        for (var k of keys) {
            var l = lines[k].replace("{}", this[k])
            ctx.fillText(l, x, y)
            y += 30
        }
    }
}

class Tip extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
    }
}

class Tower extends AbstractTexture {
    constructor(game, image, attack=1, range=150) {
        super(game, image)
        this.attack = attack
        this.range = range
        this.target = null
        this.rotation = 0
        this.showRange = true
        this.setupBullets()
    }

    setupBullets() {
        this.bullets = []
        this.bulletCoolDown = new CoolDown(20)
    }

    findTarget(enemies) {
        for (var e of enemies) {
            if (this.isInAttackRange(e)) {
                this.target = e
                return
            }
        }
        this.target = null
    }

    isInAttackRange(enemy) {
        var e = enemy
        var v1 = this.center()
        var v2 = e.center()
        var d = v1.distance(v2)
        return d < this.range
    }

    addBullet(b) {
        this.bullets.push(b)
    }

    updateBullets() {
        this.bulletCoolDown.update()
        if (this.bulletCoolDown.isActive() && this.target) {
            this.bulletCoolDown.reset()
            var bulletImage = this.game.imageByName("bullet")
            var x = this.x + (this.width - bulletImage.width) / 2
            var y = this.y + (this.height - bulletImage.height) / 2
            var b = new Bullet(this.game, bulletImage, x, y, this.range, this.rotation)
            this.addBullet(b)
        }
        for (var b of this.bullets) {
            b.update()
        }
    }

    update() {
        var t = this.target
        if (t) {
            var dy = t.y - this.y
            var dx = t.x - this.x
            var v = new Vector(dx, dy)
            this.rotation = v.angle()
        }
        this.updateBullets()
        this.clear()
    }

    clear() {
        this.bullets = this.bullets.filter(e => e.exists)
    }

    draw() {
        this.image.x = this.x
        this.image.y = this.y
        this.game.drawTransformImage(this.image, this.rotation, false, false)
        if (this.showRange) {
            this.drawRange()
        }
        this.drawBullets()
    }

    drawBullets() {
        for (var b of this.bullets) {
            b.draw()
        }
    }

    drawRange() {
        var centerX = this.x + this.width / 2
        var centerY = this.y + this.height / 2
        var ctx = this.game.context
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)"
        ctx.strokeStyle = "rgba(0, 255, 255, 1)"
        // 如果直接使用arc函数将会连续绘制
        ctx.beginPath()
        ctx.arc(centerX, centerY, this.range, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fill()
        ctx.closePath()
    }
}

class Enemy extends AbstractTexture {
    constructor(game, image, route) {
        super(game, image)
        this.route = route
        this.init()
    }

    init() {
        this.setupConfig()
        this.setupLife()
        this.setupMovement()
        this.setupReward()
    }

    setupConfig() {
        this.config = this.game.config["enemy"]
    }

    setupLife() {
        this.maxLife = this.config["life"]
        this.currentLife = this.maxLife
    }

    setupMovement() {
        this.routeIndex = 0
        this.currentDistance = 0
        this.speed = this.config["speed"]
        this.move = {
            left: () => this.x -= this.speed,
            right: () => this.x += this.speed,
            up: () => this.y -= this.speed,
            down: () => this.y += this.speed,
        }
    }

    setupReward() {
        this.reward = this.config["reward"]
    }

    moveOnRoute() {
        if (this.routeIndex == this.route.length) {
            this.game.gameOver()
            return
        }
        var step = this.route[this.routeIndex]
        var direction = step[0]
        var distance = step[1]
        if (this.currentDistance < distance) {
            this.move[direction]()
            if (this.routeIndex == 0 && this.x < 50) {
                return
            }
            this.currentDistance += this.speed
        } else {
            this.routeIndex += 1
            this.currentDistance = 0
            this.moveOnRoute()
        }
    }

    die() {
        this.exists = false
    }

    update() {
        this.moveOnRoute()
    }

    draw() {
        super.draw()
        this.drawLifebar()
    }

    drawLifebar() {
        var proportion = this.currentLife / this.maxLife
        var ctx = this.game.context
        ctx.fillStyle = "red"
        ctx.fillRect(this.x, this.y - 20, this.width, 10)
        ctx.fillStyle = "green"
        ctx.fillRect(this.x, this.y - 20, this.width * proportion, 10)
    }
}

class Bullet extends AbstractTexture {
    constructor(game, image, x, y, range, rotation) {
        super(game, image)
        this.initialX = x
        this.initialY = y
        this.rotation = rotation
        this.distance = 0
        this.range = range
        this.speed = 10
        this.exists = true
    }

    update() {
        this.distance += this.speed
        this.x = this.initialX + this.distance * Math.sin(this.rotation * Math.PI / 180)
        this.y = this.initialY + this.distance * (-Math.cos(this.rotation * Math.PI / 180))
        if (this.distance > this.range) {
            this.exists = false
        }
    }

    draw() {
        this.image.x = this.x
        this.image.y = this.y
        this.game.drawTransformImage(this.image, this.rotation, false, false)
    }
}
