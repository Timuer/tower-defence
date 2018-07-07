class Game {
    constructor(imgPaths) {
        window.fps = 50
        this.mission = 0
        // 画布、图片资源
        this.setupBasicResource()
        // 游戏场景
        this.setupScene()
        // 外部设备事件
        this.setupActions()
    }

    setupBasicResource() {
        this.canvas = document.querySelector('#id-canvas')
        this.context = this.canvas.getContext('2d')
        this.imgPaths = imgPaths
        this.imgs = {}
    }

    setupScene() {
        this.scene = null
        this.scenes = {
            "game": GameScene,
            "end": EndScene,
        }
        this.currentScene = "game"
    }

    setupKeyboardActions() {
        this.keydowns = {}
        this.actions = {}
        window.addEventListener("keydown", event => {
            this.keydowns[event.key] = "down"
        })
        window.addEventListener("keyup", function(event) {
            this.keydowns[event.key] = "up"
        })
    }

    setupMouseActions() {
        this.onMouseDrag = false
        this.mouseActions = {
            "down": [],
            "up": [],
            "drag": [],
        }
        window.addEventListener("mousedown", event => {
            this.onMouseDrag = true
            for (var a of this.mouseActions["down"]) {
                a(event)
            }
        })
        window.addEventListener("mousemove", event => {
            if (this.onMouseDrag) {
                for (var a of this.mouseActions["drag"]) {
                    a(event)
                }
            }
        })
        window.addEventListener("mouseup", event => {
            this.onMouseDrag = false
            for (var a of this.mouseActions["up"]) {
                a(event)
            }
        })
    }

    setupActions() {
        this.setupKeyboardActions()
        this.setupMouseActions()
    }

    registerAction(key, callback) {
        this.actions[key] = callback
    }

    registerMouseAction(status, callback) {
        this.mouseActions[status].push(callback)
    }

    performActions() {
        var keys = Object.keys(this.actions)
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i]
            var keyStatus = this.keydowns[k]
            if (keyStatus) {
                this.actions[k](keyStatus)
            }
            // 每次调用事件之后需要考虑十否清空按键状态，否则按键状态可能一直保持
            // 比如keyup事件我们的本意是一次按键回弹的事件，但是如果不清空，那么只要
            // 之后按键处于未被按状态，该事件就会一直被触发
            // this.keydowns[k] = null
        }
    }

    drawImage(image) {
        this.context.drawImage(image.img, image.x, image.y)
    }

    drawTransformImage(image, rotation, flipX, flipY) {
        var ctx = this.context
        var cvs = this.canvas
        ctx.save()
        ctx.translate(image.x + image.width / 2, image.y + image.height / 2)
        var scaleX = flipX ? -1 : 1
        var scaleY = flipY ? -1 : 1
        ctx.scale(scaleX, scaleY)
        ctx.rotate(rotation * Math.PI / 180)
        ctx.translate(-image.width / 2, -image.height / 2)
        ctx.drawImage(image.img, 0, 0)
        ctx.restore()
    }

    imageByName(name) {
        var img = this.imgs[name]
        return {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            img: img,
        }
    }

    init() {
        var g = this
        var imgNames = Object.keys(g.imgPaths)
        var numOfLoadedImgs = []
        for (var i = 0; i < imgNames.length; i++) {
            let name = imgNames[i]
            let img = new Image()
            img.src = g.imgPaths[name]
            img.onload = function() {
                g.imgs[name] = img
                numOfLoadedImgs.push(1)
                if (numOfLoadedImgs.length == imgNames.length) {
                    g.__start()
                }
            }
        }
    }

    runLoop() {
        var g = this
        g.performActions()
        g.update()
        g.clearCanvas()
        g.draw()
        setTimeout(function () {
            g.runLoop()
        }, 1000/window.fps)
    }

    update() {
        if (this.scene.sceneName != this.currentScene) {
            this.scene = this.scenes[this.currentScene].new(this)
        }
        this.scene.update()
    }

    draw() {
        this.scene.draw()
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    __start() {
        var scene = new GameScene(this)
        this.scene = scene

        var g = this
        setTimeout(function () {
            g.runLoop()
        }, 1000/window.fps);
    }
}

var __main = function() {
    imgPaths = {
        grass0: "img/grass0.png",
        grass1: "img/grass1.png",
        grass2: "img/grass2.png",
        road0: "img/road0.png",
        road1: "img/road1.png",
        road2: "img/road2.png",
        model0: "img/model0.png",
        model1: "img/model1.png",
        model2: "img/model2.png",
        model3: "img/model3.png",
        enemy0: "img/enemy0.png",
        enemy1: "img/enemy1.png",
        enemy2: "img/enemy2.png",
        enemy3: "img/enemy3.png",
        enemy4: "img/enemy4.png",
    }
    onDebugMode(true)
    var game = new Game(imgPaths)
    game.init()
}

__main()