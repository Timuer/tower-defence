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
        g.setupModels()
        g.setupEnemies()
        g.setupTowers()
        g.setupActions()
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
        var gridX = x - x % this.gridWidth
        var gridY = y - y % this.gridHeight
        this.chosenGrid = [gridX, gridY]
        this.gridEnable = true
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
        for (var i = 0; i < 4; i++) {
            var name = "model" + i
            var t = new TowerModel(this.game, this.game.imageByName(name))
            t.x = w - (i + 1) * t.width
            t.y = h - t.height
            this.addModel(t)
        }
    }

    setupEnemies() {
        this.enemies = []
        var x = 0
        for (var i = 0; i < 10; i++) {
            var name = "enemy" + rangeBetween(0, 5)
            var e = new Enemy(this.game, this.game.imageByName(name))
            e.x = x
            e.y = 200
            this.addEnemy(e)
            x += 60
        }
    }

    setupTowers() {
        this.towers = []
        this.chosenTower = null
    }

    chooseTower(x, y) {
        for (var m of this.models) {
            if (isPointInSquare(x, y, m.x, m.y, m.width, m.height)) {
                var t = m.createTower()
                // 鼠标位置在塔模型上的偏移
                t.towerOffsetX = x - m.x
                t.towerOffsetY = y - m.y
                this.chosenTower = t
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
            t.findTarget(this.enemies)
            if (t.target) {
                t.target.currentLife -= t.attack
                if (t.target.currentLife <= 0) {
                    t.target.die()
                    t.target = null
                }
            }
        }
    }

    update() {
        super.update()
        this.updateWar()
        this.clear()
    }

    drawShiningBorder(x, y, w, h, color, lineWidth) {
        var ctx = this.game.context
        var grad = ctx.createLinearGradient(x + lineWidth / 2, 0, x - lineWidth / 2, 0)
        grad.addColorStop(0, "#fff")
        grad.addColorStop(0.5, color)
        grad.addColorStop(1, "#fff")
        ctx.fillStyle = grad
        ctx.fillRect(x - lineWidth / 2, y, lineWidth, h)
        grad = ctx.createLinearGradient(x, y + lineWidth, x, y - lineWidth)
        grad.addColorStop(0, "#fff")
        grad.addColorStop(0.5, color)
        grad.addColorStop(1, "#fff")
        ctx.fillStyle = grad
        ctx.fillRect(x, y - lineWidth / 2, w, lineWidth)
        grad = ctx.createLinearGradient(x + w -lineWidth, y, x + w + lineWidth, y)
        grad.addColorStop(0, "#fff")
        grad.addColorStop(0.5, color)
        grad.addColorStop(1, "#fff")
        ctx.fillStyle = grad
        ctx.fillRect(x + w - lineWidth / 2, y, lineWidth, h)
        grad = ctx.createLinearGradient(x, y + h - lineWidth, x, y + h + lineWidth)
        grad.addColorStop(0, "#fff")
        grad.addColorStop(0.5, color)
        grad.addColorStop(1, "#fff")
        ctx.fillStyle = grad
        ctx.fillRect(x, y + h - lineWidth / 2, w, lineWidth)
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
