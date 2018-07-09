class UI {
    constructor(game, image) {
        this.game = game
        this.image = image
        this.x = 0
        this.y = 0
        this.width = this.image.width
        this.height = this.image.height
        this.exists = true
    }

    update() {

    }

    draw() {
        this.image.x = this.x
        this.image.y = this.y
        this.game.drawImage(this.image)
    }
}

class EditBox extends UI {
    constructor(game, image) {
        super(game, image)
    }

    drawText() {
        var ctx = this.game.context
        var w = this.game.canvas.width
        var h = this.game.canvas.height
        ctx.font = "100px sans-serif"
        ctx.fillStyle = "RGB(223, 203, 108)"
        ctx.fillText("泡泡塔防", w / 2 - 200, h / 2 + 30)
    }

    draw() {
        super.draw()
        this.drawText()
    }
}

class TowerBase extends UI {
    constructor(game, image) {
        super(game, image)
    }
}

class MoneyBox extends UI {
    constructor(game, image, x, y, count) {
        super(game, image)
        this.x = x
        this.y = y
        this.offsetX = 30
        this.offsetY = 10
        this.count = count
        this.setupNumbers()
    }

    setupNumbers() {
        var numberImage = this.game.imageByName("numbers")
        this.numbers = new Number(this.game, numberImage, this.count)
        this.calNumberPos()
    }

    calNumberPos() {
        this.numbers.x = this.x + this.offsetX + (this.width - this.offsetX - this.numbers.calWidth()) / 2
        this.numbers.y = this.y + this.offsetY
    }

    changeCount(count) {
        this.count += count
        this.numbers.changeNumber(this.count)
        this.calNumberPos()
    }

    increase(count) {
        this.changeCount(count)
    }

    decrease(count) {
        this.changeCount(-count)
    }

    draw() {
        super.draw()
        this.numbers.draw()
    }
}

class Number extends UI {
    constructor(game, image, num) {
        super(game, image)
        this.num = num
        this.init()
    }

    init() {
        this.drawParameters = {}
        // 每个单独数字的宽和高
        this.w = this.image.width / 10
        this.h = this.image.height
        for (var i = 0; i < 10; i++) {
            var param = {}
            param["sx"] = i * this.w
            param["sy"] = 0
            param["sWidth"] = this.w
            param["sHeight"] = this.h
            this.drawParameters[String(i)] = param
        }
    }

    calWidth() {
        var nums = this.getIsolatedNumbers()
        return nums.length * this.w
    }

    changeNumber(n) {
        this.num = n
    }

    getNumber() {
        return this.num
    }

    getIsolatedNumbers() {
        var n = this.num
        var nums = []
        var len = String(n).length
        var s = -1
        for (var i = 0; i < len; i++) {
            s = n % 10
            n = (n - s) / 10
            nums.push(s)
        }
        return nums
    }

    drawSingleNumber(num, x, y) {
        var ctx = this.game.context
        var p = this.drawParameters[String(num)]
        ctx.drawImage(this.image.img, p.sx, p.sy, p.sWidth, p.sHeight, x, y, p.sWidth, p.sHeight)
    }

    drawNumbers() {
        var nums = this.getIsolatedNumbers()
        var len = nums.length
        for (var i = 0; i < len; i++) {
            var x = this.x + i * this.w
            var y = this.y
            this.drawSingleNumber(nums.pop(), x, y)
        }
    }

    draw() {
        this.drawNumbers()
    }
}

class Button extends UI {
    constructor(game, image, lightImage, x, y) {
        super(game, image)
        this.lightImage = lightImage
        this.setupPosition(x, y)
        this.onHover = false
    }

    setupPosition(x, y) {
        this.x = x
        this.y = y
        this.image.x = this.x
        this.image.y = this.y
        this.lightImage.x = this.x
        this.lightImage.y = this.y
    }

    draw() {
        if (this.onHover) {
            this.game.drawImage(this.lightImage)
        } else {
            this.game.drawImage(this.image)
        }
    }
}

class StartButton extends Button {
    constructor(game, image, lightImage, x, y) {
        super(game, image, lightImage, x, y)
    }

    drawText() {
        var s = this.game.imageByName("startTitle")
        s.x = this.x + (this.width - s.width) / 2
        s.y = this.y + (this.height - s.height) / 2
        this.game.drawImage(s)
    }

    draw() {
        super.draw()
        this.drawText()
    }
}

class BackButton extends Button {
    constructor(game, image, lightImage, x, y) {
        super(game, image, lightImage, x, y)
    }
}

class StartBg extends UI {
    constructor(game, image) {
        super(game, image)
    }
}
