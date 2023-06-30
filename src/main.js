let program = null
const { solve, makeGraph } = require('./src/core/solver.js')
require('./src/app/syntax_highlight_rules.js')
require('./src/app/main.js')
const { getParsedQuery } = require('./src/app/button_controls.js')
const { formatProgram, accelarateCodeParse } = require("app/main")
const { fillDropdowns } = require("./src/app/dropdown_panel.js")
const { renderGraph } = require('./src/app/graph_rendering.js')

function setProgram(p, format = true) {
    program = p
    if (format) formatProgram(p)
    fillDropdowns(p)
}

function getParsedProgram() {
    accelarateCodeParse()
    return program
}

document.querySelectorAll("#main-tab, #query-tab").forEach((tab) => {
    tab.addEventListener('show.bs.tab', event => {
        let controls = document.getElementById(event.target.getAttribute('aria-controls')).querySelector(".editor-locator");
        controls.parentNode.insertBefore(document.getElementById("editor"), controls);
    })
})
document.querySelector("#graph-tab").addEventListener('show.bs.tab', event => {
    renderGraph(makeGraph(getParsedProgram()))
})
