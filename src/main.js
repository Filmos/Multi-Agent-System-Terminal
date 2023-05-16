let program = null
const { solve } = require('./src/core/solver.js')
require('./src/app/syntax_highlight_rules.js')
require('./src/app/main.js')
const { getParsedQuery } = require('./src/app/button_controls.js')
const { formatProgram, accelarateCodeParse } = require("app/main")
const { fillDropdowns } = require("./src/app/dropdown_panel.js")

function setProgram(p) {
    program = p
    formatProgram(p)
    fillDropdowns(p)
}

function getParsedProgram() {
    accelarateCodeParse()
    return program
}