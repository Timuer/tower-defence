class Scene {
    constructor(game) {
        this.game = game
        this.sceneName = ""
        this.elements = []
    }

    static new(game) {
        return new this(game)
    }

    addElement(elem) {
        this.elements.push(elem)
    }

    update() {
        for (var e of this.elements) {
            e.update()
        }
    }

    draw() {
        for (var e of this.elements) {
            e.draw()
        }
    }

    clear() {
        this.elements = this.elements.filter(e => e.exists === true)
    }

    isSquareCollide(x1, y1, w1, h1, x2, y2, w2, h2) {
        var minX = x1 <= x2 ? x1 : x2
        var maxX = x1 + w1 <= x2 + w2 ? x2 + w2 : x1 + w1
        var minY = y1 <= y2 ? y1 : y2
        var maxY = y1 + h1 <= y2 + h2 ? y2 + h2 : y1 + h1
        return (maxX - minX <= w1 + w2) && (maxY - minY <= h1 + h2)
    }
}

class StartScene extends Scene {
    constructor(game) {
        super(game)
        this.sceneName = "start"
        this.width = this.game.canvas.width
        this.height = this.game.canvas.height
        this.startBtn = null
        this.elements = []
        this.init()
    }

    init() {
        var startBg = new StartBg(this.game, this.game.imageByName("startBg"))
        this.addElement(startBg)
        var editBox = new EditBox(this.game, this.game.imageByName("editBox"))
        editBox.x = (this.width - editBox.width) / 2
        editBox.y = (this.height - editBox.height) / 2
        this.addElement(editBox)
        var btn = new StartButton(this.game, this.game.imageByName("btn"))
        btn.x = (this.width - btn.width) / 2
        btn.y = this.height - btn.height - 100
        this.addElement(btn)
        this.startBtn = btn
        this.registerMouseAction()
    }

    registerMouseAction() {
        var p = this
        p.game.registerMouseAction("click", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            var s = p.startBtn
            if (isPointInSquare(x, y, s.x, s.y, s.width, s.height)) {
                p.game.currentScene = "game"
            }
        })
    }
}

class GameScene extends Scene {
    constructor(game) {
        super(game)
        this.sceneName = "game"
        this.init()
    }

    init() {
        var g = this
        g.setupBackground()
        g.setupGrid()
        g.setupUI()
        g.setupModels()
        g.setupRoute()
        g.setupEnemies()
        g.setupTowers()
        g.setupActions()
        // g.setupMoney()
    }

    setupUI() {
        this.setupMoney()
        this.setupTowerBase()
    }

    setupMoney() {
        var boxImage = this.game.imageByName("moneyBox")
        var x = 0
        var y = this.game.canvas.height - boxImage.height
        this.money = new MoneyBox(this.game, boxImage, x, y, 100)
        this.addElement(this.money)
    }

    setupTowerBase() {
        var baseImage = this.game.imageByName("towerBase")
        var base = new TowerBase(this.game, baseImage)
        var offsetX = 10
        var offsetY = 10
        base.x = this.game.canvas.width - baseImage.width + offsetX
        base.y = this.game.canvas.height - baseImage.height + offsetY
        this.addElement(base)
    }

    setupBackground() {
        var images = {
            grass: [],
            road: [],
        }
        for (var i = 0; i < 3; i++) {
            var image = this.game.imageByName("grass" + i)
            images["grass"].push(image)
            image = this.game.imageByName("road" + i)
            images["road"].push(image)
        }
        var bg = new Background(this.game, images)
        this.addElement(bg)
    }

    setupGrid() {
        this.gridWidth = 120
        this.gridHeight = 100
        this.grids = []
        this.chosenGrid = null
        this.gridEnable = true
    }

    chooseGrid(x, y) {
        this.gridEnable = true
        var gridX = x - x % this.gridWidth
        var gridY = y - y % this.gridHeight
        this.chosenGrid = [gridX, gridY]
        for (var m of missionMap[this.game.mission]) {
            var x = m[1] * this.gridWidth
            var y = m[0] * this.gridHeight
            if (gridX == x && gridY == y) {
                this.gridEnable = false
                return
            }
        }
        if (this.grids.length > 0) {
            for (var g of this.grids) {
                if (gridX == g[0] && gridY == g[1]) {
                    this.gridEnable = false
                    break
                }
            }
        }
    }

    setupModels() {
        this.models = []
        var w = this.game.canvas.width
        var h = this.game.canvas.height
        var offsetX = -40
        var offsetY = -20
        var modelNames = ["小炮", "大炮", "歼灭炮", "毁世炮"]
        for (var i = 0; i < modelNames.length; i++) {
            var name = modelNames[i]
            var t = new TowerModel(this.game, this.game.imageByName(name), this.game.imageByName("灰色" + name), name)
            t.x = w - (i + 1) * t.width + offsetX
            t.y = h - t.height + offsetY
            this.addModel(t)
        }
    }

    setupRoute() {
        this.route = []
        var m = missionMap[this.game.mission]
        var nextStep = ""
        var dif = 0
        var route = []
        var w = 120
        var h = 100
        for (var i = 0; i < m.length - 1; i++) {
            var j = i + 1
            var x1 = m[i][1]
            var y1 = m[i][0]
            var x2 = m[j][1]
            var y2 = m[j][0]
            if (x1 == x2) {
                dif = y2 - y1
                if (dif < 0) {
                    nextStep = "up"
                } else {
                    nextStep = "down"
                }
                this.route.push([nextStep, h])
            } else {
                dif = x2 - x1
                if (dif < 0) {
                    nextStep = "left"
                } else {
                    nextStep = "right"
                }
                this.route.push([nextStep, w])
            }
        }
    }

    getInitPositions(count) {
        var w = this.gridWidth
        var h = this.gridHeight
        var firstDirection = this.route[0][0]
        var firstPos = missionMap[this.game.mission][0]
        // 根据栅格的宽度和敌军图片的宽度确定初始位置
        var x = firstPos[1] * w + (w - 50) / 2
        var y = firstPos[0] * h + (h - 45) / 2
        // log("x, y", x, y)
        var initPos = {
            right: (x, y) => [x -= w, y],
            up: (x, y) => [x, y -= h],
            down: (x, y) => [x, y += h],
        }
        var positions = []
        for (var i = 0; i < count; i++) {
            var pos = initPos[firstDirection](x, y)
            positions.push(pos)
            var x = pos[0]
            var y = pos[1]
        }
        return positions
    }

    setupEnemies() {
        this.enemyCount = 20
        this.enemies = []
        var positions = this.getInitPositions(this.enemyCount)
        // log(positions)
        for (var i = 0; i < this.enemyCount; i++) {
            var name = "enemy" + rangeBetween(0, 5)
            var e = new Enemy(this.game, this.game.imageByName(name), this.route)
            e.x = positions[i][0]
            e.y = positions[i][1]
            this.addEnemy(e)
        }
    }

    setupTowers() {
        this.towers = []
        this.chosenTower = null
    }

    chooseTower(x, y) {
        for (var m of this.models) {
            if (isPointInSquare(x, y, m.x, m.y, m.width, m.height)) {
                if (m.isActive()) {
                    var t = m.createTower()
                    this.money.decrease(m.price)
                    // 鼠标位置在塔模型上的偏移
                    t.towerOffsetX = x - m.x
                    t.towerOffsetY = y - m.y
                    this.chosenTower = t
                }
            }
        }
    }

    setupActions() {
        var g = this
        g.game.registerMouseAction("down", function(event) {
            // 鼠标在画布上的偏移
            var x = event.offsetX
            var y = event.offsetY
            g.chooseTower(x, y)
        })

        g.game.registerMouseAction("drag", function(event) {
            var t = g.chosenTower
            if (t !== null) {
                t.showRange = true
                var x = event.offsetX
                var y = event.offsetY
                g.chooseGrid(x, y)
                t.x = x - t.towerOffsetX
                t.y = y - t.towerOffsetY
            }
        })

        g.game.registerMouseAction("up", function(event) {
            var t = g.chosenTower
            if (t) {
                t.showRange = false
                var c = g.chosenGrid
                if (g.gridEnable) {
                    t.x = c[0] + g.gridWidth / 2 - t.width / 2
                    t.y = c[1] + g.gridHeight / 2 - t.height / 2
                    g.grids.push(g.chosenGrid)
                    g.addTower(t)
                }
            }
            g.chosenTower = null
            g.chosenGrid = null
        })

    }

    addEnemy(enemy) {
        this.addElement(enemy)
        this.enemies.push(enemy)
    }

    addTower(tower) {
        this.addElement(tower)
        this.towers.push(tower)
    }

    addModel(model) {
        this.addElement(model)
        this.models.push(model)
    }

    updateWar() {
        for (var t of this.towers) {
            this.updateTarget(t)
            this.updateBullets(t)
        }
    }

    updateBullets(tower) {
        var t = tower
        for (var b of t.bullets) {
            // log("bullet", b)
            for (var e of this.enemies) {
                if (this.isSquareCollide(b.x, b.y, b.width, b.height, e.x, e.y, e.width, e.height)) {
                    // log("collide")
                    e.currentLife -= t.attack
                    b.exists = false
                }
            }
        }
    }

    updateTarget(tower) {
        var t = tower
        t.findTarget(this.enemies)
        if (t.target) {
            if (t.target.currentLife <= 0) {
                this.money.increase(t.target.reward)
                t.target.die()
                t.target = null
            }
        }
    }

    update() {
        super.update()
        this.updateWar()
        this.clear()
    }

    draw() {
        super.draw()
        if (this.chosenTower) {
            this.chosenTower.draw()
        }
        var c = this.chosenGrid
        if (c) {
            var ctx = this.game.context
            var color = this.gridEnable ? "blue" : "red"
            ctx.strokeStyle = color
            ctx.strokeRect(c[0], c[1], this.gridWidth, this.gridHeight)
        }
        // this.drawShiningBorder(100, 200, 200, 200, "red", 7)
    }

    clear() {
        super.clear()
        this.enemies = this.enemies.filter(e => e.exists === true)
    }
}

class PauseScene extends Scene {
    constructor(game) {
        super(game)
        this.sceneName = "pause"
    }

    draw() {
        var ctx = this.game.context
        var w = this.game.canvas.width
        var h = this.game.canvas.height
        ctx.font = "100px sans-serif"
        ctx.fillStyle = "#000"
        ctx.fillText("游戏结束", w / 2 - 200, h / 2 + 50)
    }
}


class EndScene extends Scene {
    constructor(game) {
        super(game)
        this.sceneName = "end"
    }

    draw() {
        var ctx = this.game.context
        var w = this.game.canvas.width
        var h = this.game.canvas.height
        ctx.font = "100px sans-serif"
        ctx.fillStyle = "#000"
        ctx.fillText("游戏结束", w / 2 - 200, h / 2 + 50)
    }
}
