class Scene {
    constructor(game) {
        this.game = game
        this.sceneName = ""
        this.elements = []
    }

    static new(...args) {
        return new this(...args)
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
        this.setupBg()
        this.setupBox()
        this.setupBtn()
        this.registerMouseAction()
    }

    setupBox() {
        var editBox = new EditBox(this.game, this.game.imageByName("editBox"))
        editBox.x = (this.width - editBox.width) / 2
        editBox.y = (this.height - editBox.height) / 2
        this.addElement(editBox)
    }

    setupBtn() {
        var btnGreyImage = this.game.imageByName("btn_grey")
        var btnImage = this.game.imageByName("btn")
        var x = (this.width - btnImage.width) / 2
        var y = this.height - btnImage.height - 100
        var btn = new StartButton(this.game, btnGreyImage, btnImage, x, y)
        this.addElement(btn)
        this.startBtn = btn
    }

    setupBg() {
        var startBg = new StartBg(this.game, this.game.imageByName("startBg"))
        this.addElement(startBg)
    }

    registerMouseAction() {
        var p = this
        var b = p.startBtn
        p.game.registerMouseAction("click", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            if (isPointInSquare(x, y, b.x, b.y, b.width, b.height)) {
                p.game.currentScene = "game"
            }
        })
        p.game.registerMouseAction("hover", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            if (isPointInSquare(x, y, b.x, b.y, b.width, b.height)) {
                b.onHover = true
                p.game.canvas.style.cursor = "pointer"
            } else {
                b.onHover = false
                p.game.canvas.style.cursor = "default"
            }
        })
    }
}

class GameScene extends Scene {
    constructor(game, moneyCount = 50) {
        super(game)
        this.sceneName = "game"
        this.moneyCount = moneyCount
        this.init()
    }

    init() {
        var g = this
        g.setupConfig()
        g.setupBackground()
        g.setupGrid()
        g.setupRoute()
        g.setupUI()
        g.setupEnemies()
        g.setupTowers()
        g.setupModels()
        g.setupActions()
        g.setupInterlude()
    }

    setupInterlude() {
        this.interludeTime = 100
        var level = this.game.mission + 1
        this.interludeText = "第 {} 关".replace("{}", String(level))
    }

    setupConfig() {
        this.missionMap = this.game.config["missionMap"]
    }

    setupUI() {
        this.setupMoney()
        this.setupTowerBase()
    }

    setupMoney() {
        var boxImage = this.game.imageByName("moneyBox")
        var x = 0
        var y = this.game.canvas.height - boxImage.height
        this.money = new MoneyBox(this.game, boxImage, x, y, this.moneyCount)
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
        for (var m of this.missionMap) {
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
        var offsetY = -20
        var modelNames = ["毁世炮", "歼灭炮", "大炮", "小炮"]
        for (var i = 0; i < modelNames.length; i++) {
            var name = modelNames[i]
            var towerImage = this.game.imageByName(name)
            var greyTowerImage = this.game.imageByName("灰色" + name)
            var x = w - (i + 1) * 100
            var y = h - towerImage.height + offsetY
            var t = new TowerModel(this.game, towerImage, greyTowerImage, name, x, y)
            this.addModel(t)
        }
    }

    setupRoute() {
        this.route = []
        var m = this.missionMap
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
        var firstPos = this.missionMap[0]
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

    getTowerModel(x, y) {
        for (var m of this.models) {
            if (isPointInSquare(x, y, m.x, m.y, m.width, m.height)) {
                return m
            }
        }
        return null
    }

    chooseTower(x, y) {
        var m = this.getTowerModel(x, y)
        if (m && m.isActive()) {
            var t = m.createTower()
            this.money.decrease(m.price)
            // 鼠标位置在塔模型上的偏移
            t.towerOffsetX = x - m.x
            t.towerOffsetY = y - m.y
            this.chosenTower = t
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
                g.game.canvas.style.cursor = "pointer"
                t.showRange = true
                var x = event.offsetX
                var y = event.offsetY
                g.chooseGrid(x, y)
                t.x = x - t.towerOffsetX
                t.y = y - t.towerOffsetY
            }
        })

        g.game.registerMouseAction("hover", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            var m = g.getTowerModel(x, y)
            if (m !== null) {
                g.game.canvas.style.cursor = "pointer"
                m.generateTip()
            } else {
                g.game.canvas.style.cursor = "default"
                for (var m of g.models) {
                    m.removeTip()
                }
            }
        })

        g.game.registerMouseAction("up", function(event) {
            var t = g.chosenTower
            if (t) {
                g.game.canvas.style.cursor = "default"
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
        if (this.enemies.length == 0) {
            this.game.nextMission()
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
                this.moneyCount = this.money.count
                this.game.score += 100
                // log(this.moneyCount)
                t.target.die()
                t.target = null
            }
        }
    }

    update() {
        if (this.interludeTime > 0) {
            this.interludeTime--
            return
        }
        super.update()
        this.updateWar()
        this.clear()
    }

    drawInterludeText() {
        var ctx = this.game.context
        ctx.font = "100px sans-serif"
        ctx.fillStyle = "#000"
        var w = this.game.canvas.width
        var h = this.game.canvas.height
        var offsetX = 150
        var offsetY = 0
        ctx.fillText(this.interludeText, w / 2 - offsetX, h / 2 - offsetY)
    }

    draw() {
        if (this.interludeTime > 0) {
            this.drawInterludeText()
            return
        }
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
        this.width = this.game.canvas.width
        this.height = this.game.canvas.height
        this.setupBackBtn()
        this.registerMouseAction()
    }

    setupBackBtn() {
        var greyImage = this.game.imageByName("back_grey")
        var lightImage = this.game.imageByName("back")
        var offsetY = -80
        var x = (this.width - greyImage.width) / 2
        var y = this.height - greyImage.width + offsetY
        this.btn = new BackButton(this.game, greyImage, lightImage, x, y)
    }

    registerMouseAction() {
        var p = this
        var b = p.btn
        p.game.registerMouseAction("hover", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            if (isPointInSquare(x, y, b.x, b.y, b.width, b.height)) {
                p.game.canvas.style.cursor = "pointer"
                b.onHover = true
            } else {
                p.game.canvas.style.cursor = "default"
                b.onHover = false
            }
        })
        p.game.registerMouseAction("click", function(event) {
            var x = event.offsetX
            var y = event.offsetY
            if (isPointInSquare(x, y, b.x, b.y, b.width, b.height)) {
                p.game.restart()
            }
        })
    }

    drawBg() {
        var bg = this.game.imageByName("startBg")
        this.game.drawImage(bg)
    }

    drawTrophy() {
        var t = this.game.imageByName("trophy")
        var offsetY = -120
        t.x = (this.width - t.width) / 2
        t.y = (this.height - t.height) / 2 + offsetY
        this.game.drawImage(t)
    }

    drawScore() {
        var ctx = this.game.context
        var txt = "您的得分：" + String(this.game.score)
        ctx.font = "60px sans-serif"
        ctx.fillStyle = "RGB(255, 221, 17)"
        var offsetX = -180
        var offsetY = 50
        ctx.fillText(txt, this.width / 2 + offsetX, this.height / 2 + offsetY)
    }

    drawBackBtn() {
        this.btn.draw()
    }

    draw() {
        this.drawBg()
        this.drawTrophy()
        this.drawScore()
        this.drawBackBtn()
    }
}
