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

class Player extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
        this.x = game.canvas.width / 5
        this.y = game.canvas.height / 2
        this.speedX = 5
        this.speedY = 0
        this.jumpHeight = 20
        this.gravity = 0.3
        this.rotation = 0
        this.animation = new Animation(game, this.x, this.y)
        this.setupActions()
    }

    setupActions() {
        var p = this
        p.game.registerAction("a", function(keyStatus) {
            if (keyStatus == "down") {
                p.animation.flipX = true
                p.move(-p.speedX, keyStatus)
            }
        })
        p.game.registerAction("d", function(keyStatus) {
            if (keyStatus == "down") {
                p.animation.flipX = false
                p.move(p.speedX, keyStatus)
            }
        })
        p.game.registerAction("f", function(keyStatus) {
            if (keyStatus == "down") {
                p.jump()
            }
        })
    }

    jump() {
        this.rotation = -45
        this.y -= this.jumpHeight
        this.speedY = 0
    }

    update() {
        super.update()
        // 调整玩家坐标和角度
        if (this.rotation < 45) {
            this.rotation += 5
        }
        if (this.y >= 470) {
            this.y = 470
        } else {
            this.y += this.speedY
            this.speedY += this.gravity
        }
        // 将与绘制动画相关的参数同步到animation中
        this.animation.x = this.x
        this.animation.y = this.y
        this.animation.rotation = this.rotation
        this.animation.update()
    }

    draw() {
        this.animation.draw()
    }

    move(dist, keyStatus) {
        if (keyStatus == "down") {
            this.x += dist
        }
    }

    debug() {
        this.jumpHeight = config.player_jump_height.value
    }
}

class Pipes extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
        this.numPipes = 5
        this.pipesX = []
        this.pipesH = []
        this.pipeHeight = 420
        this.pipeWidth = 60
        this.pipeVerticleSpace = 200
        this.pipeHorizontalSpace = 300
        this.init()
    }

    init() {
        var x = this.game.canvas.width
        for (var i = 0; i < this.numPipes; i++) {
            this.pipesX.push(x)
            this.pipesH.push(rangeBetween(-400, -200))
            x += this.pipeHorizontalSpace
        }
    }

    update() {
        super.update()
        for (var i = 0; i < this.numPipes; i++) {
            this.pipesX[i] -= 5
        }
        if (this.pipesX[0] < -this.pipeWidth) {
            var newX = this.pipesX[this.numPipes - 1] + this.pipeHorizontalSpace
            this.pipesX.push(newX)
            this.pipesX.shift()
            this.pipesH.push(rangeBetween(-400, -200))
            this.pipesH.shift()
        }
    }

    draw() {
        var pipe = this.image
        for (var i = 0; i < this.numPipes; i++) {
            pipe.x = this.pipesX[i]
            pipe.y = this.pipesH[i]
            this.game.drawImage(pipe)
            pipe.y = this.pipesH[i] + this.pipeHeight + this.pipeVerticleSpace
            this.game.drawTransformImage(pipe, 0, false, true)
        }
    }

    debug() {
        this.pipeVerticleSpace = config.pipe_verticle_space.value
        this.pipeHorizontalSpace = config.pipe_horizontal_space.value
    }
}

class TowerModel extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
        this.towerOffsetX = 0
        this.towerOffsetY = 0
    }

    createTower() {
        var t = new Tower(this.game, this.image)
        t.x = this.x
        t.y = this.y
        return t
    }
}

class Tower extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
        this.attack = 1
        this.range = 100
        this.target = null
        this.rotation = 0
        this.showRange = true
    }

    findTarget(enemies) {
        for (var e of enemies) {
            if (this.isInAttackRange(e)) {
                this.target = e
                break
            }
        }
    }

    isInAttackRange(enemy) {
        var e = enemy
        var v1 = this.center()
        var v2 = e.center()
        var d = v1.distance(v2)
        return d < this.range
    }

    update() {
        var t = this.target
        if (t) {
            var dy = t.y - this.y
            var dx = t.x - this.x
            var v = new Vector(dx, dy)
            this.rotation = v.angle()
        }
    }

    draw() {
        this.image.x = this.x
        this.image.y = this.y
        this.game.drawTransformImage(this.image, this.rotation, false, false)
        if (this.showRange) {
            this.drawRange()
        }
    }

    drawRange() {
        var centerX = this.x + this.width / 2
        var centerY = this.y + this.height / 2
        var ctx = this.game.context
        ctx.fillStyle = "rgba(0, 255, 255, 0.5)"
        // 如果直接使用arc函数将会连续绘制
        ctx.beginPath()
        ctx.arc(centerX, centerY, this.range, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
}

class Enemy extends AbstractTexture {
    constructor(game, image) {
        super(game, image)
        this.maxLife = 100
        this.currentLife = this.maxLife
        this.setupMovement()
    }

    setupMovement() {
        this.speed = 2
        this.movement = {
            "left": () => this.x += this.speed,
            "right": () => this.x -= this.speed,
            "up": () => this.y -= this.speed,
            "down": () => this.y += this.speed,
        }

    }

    die() {
        this.exists = false
    }

    update() {
        this.x += 2
    }

    draw() {
        super.draw()
        this.drawLifebar()
    }

    generateRoute() {

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
