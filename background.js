class Background {
    constructor(game, images) {
        this.game = game
        this.images = images
        this.width = 120
        this.height = 100
        this.indexes = []
        this.exists = true
        this.init()
    }

    init() {
        var w = this.width
        var h = this.height
        var cw = this.game.canvas.width
        var ch = this.game.canvas.height
        this.columns = Math.floor(cw / w)
        this.rows = Math.floor(ch / h)
        for (var i = 0; i < this.columns * this.rows; i++) {
            this.indexes.push(rangeBetween(0, 3))
        }
    }

    update() {

    }

    draw() {
        this.drawGrass()
        this.drawLand()
    }

    drawGrass() {
        var index = 0
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                var x = j * this.width
                var y = i * this.height
                var index = this.indexes[i * this.columns + j]
                var image = this.images["grass"][index]
                image.x = x
                image.y = y
                this.game.drawImage(image)
            }
        }
    }

    drawLand() {
        var landList = missionMap[this.game.mission]
        var index = 0
        for (var l of landList) {
            var x = l[1] * this.width
            var y = l[0] * this.height
            var index = this.indexes[l[0] * this.columns + l[1]]
            var image = this.images["road"][index]
            image.x = x
            image.y = y
            this.game.drawImage(image)
        }
    }
}
