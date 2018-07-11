var log = console.log.bind(console)

var e = function(sel) {
    return document.querySelector(sel)
}

var rangeBetween = function(start, end) {
    return Math.floor((Math.random() * (end - start) + start))
}

var isPointInSquare = function(px, py, x, y, w, h) {
    var cond1 = px > x && px < x + w
    var cond2 = py > y && py < y + h
    return cond1 && cond2
}


class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    distance(v) {
        var w = this.x - v.x
        var h = this.y - v.y
        return Math.sqrt(w * w + h * h)
    }

    angle() {
        return Math.atan2(this.x, -this.y) * 180 / Math.PI
    }
}
