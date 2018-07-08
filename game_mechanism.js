class CoolDown {
    constructor(coolDownTime) {
        this.max = coolDownTime
        this.current = this.max
    }

    update() {
        if (this.current > 0) {
            this.current--
        }
    }

    isActive() {
        return this.current == 0
    }

    reset() {
        this.current = this.max
    }
}
