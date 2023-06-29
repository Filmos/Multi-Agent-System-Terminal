function getParsedQuery() {
    const result = {
        type: document.getElementById("query-type").value,
        target: document.getElementById("query-target").value,
        actions: document.getElementById("query-program").value,
    }

    return result
}

document.querySelectorAll("#query-selector select, #query-selector input").forEach((option) => {
    option.addEventListener("change", () => {
        document.getElementById("query-result").innerText = ""
        getParsedQuery()
    })
})
document.getElementById("query-button").addEventListener("click", () => {
    const query = getParsedQuery()
    const program = getParsedProgram()
    try {
        const result = solve(program, query)
        document.getElementById("query-result").innerText = `Result: ${result}`
    } catch (e) {
        document.getElementById("query-result").innerText = `Invalid query: ${e.message}`
    }
})

document.getElementById("panel-dropdown").addEventListener("click", () => { accelarateCodeParse() })

module.exports = { getParsedQuery }