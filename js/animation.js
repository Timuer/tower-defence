class Animation {
    constructor(game, x, y) {
        this.game = game
        // 动画相关参数
        this.x = x
        this.y = y
        // 存储各个动画序列的image对象数组
        this.animations = {
            fly: [],
        }
        this.currentAnimation = "fly"
        // 存储各个动画序列的序列数量
        this.frameCount = {
            fly: 3,
        }
        // 当前动画序列的下标
        this.frameIndex = 0
        // 当前切换动画序列的剩余间隔帧数
        this.frameInterval = 5
        // 绘制图片的相关参数
        this.flipX = false
        this.rotation = 0
        this.init()
    }

    init() {
        for (var i = 0; i < this.frameCount["fly"]; i++) {
            var b = this.game.imageByName("bird" + i)
            this.animations["fly"].push(b)
        }
    }

    update() {
        // 在固定帧切换动画序列下标
        if (this.frameInterval == 0) {
            this.frameInterval = 5
            this.frameIndex = (this.frameIndex + 1) % this.frameCount[this.currentAnimation]
        }
        this.frameInterval--
    }

    draw() {
        var frame = this.animations[this.currentAnimation][this.frameIndex]
        frame.x = this.x
        frame.y = this.y
        this.game.drawTransformImage(frame, this.rotation, this.flipX, false)
    }
}
