var templatePane = function(key, item) {
    var t = `
        <div class="config-bar">
            <input data-variable="config.${key}.value" type="range" max="${item.max}" value="${item.value}">
            ${item.desctiption}：<span>${item.value}</span>
        </div>
    `
    return t
}

var addConfigBars = function(sel) {
    var pane = e(sel)
    var keys = Object.keys(config)
    var html = ""
    for (var k of keys) {
        var item = config[k]
        html += templatePane(k, item)
    }
    pane.insertAdjacentHTML("beforeEnd", html)
}

var adjustBars = function(sel, callback) {
    var bars = document.querySelectorAll(sel)
    for (var b of bars) {
        var input = b.querySelector("input")
        input.addEventListener("input", callback)
    }
}

var onDebugMode = function(flag) {
    if (flag) {
        addConfigBars(".debug-pane")
        adjustBars(".config-bar", function(event) {
            var input = event.target
            var variable = input.dataset.variable
            var value = Number(input.value)
            eval(variable + "=" + value)
            // 将输入条的当前值同步到span中显示出来
            var d = input.closest("div")
            d.querySelector("span").innerText = value
        })
    }
}
