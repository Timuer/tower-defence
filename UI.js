class UI {
    constructor(game, image) {
        this.game = game
        this.image = image
        this.x = 0
        this.y = 0
        this.width = this.image.width
        this.height = this.image.height
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

class StartButton extends UI {
    constructor(game, image) {
        super(game, image)
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

class StartBg extends UI {
    constructor(game, image) {
        super(game, image)
    }
}
