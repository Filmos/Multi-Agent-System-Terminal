function getParsedQuery() {
    const result = {
        tag: document.getElementById("query-tag").value,
        target: {}
    }

    const targetType = document.getElementById("query-target-type").value
    if (targetType === "(fluent)") {
        result.target.type = "fluent"
        result.target.fluent = document.getElementById("query-target").value
    } else {
        result.target.type = targetType
        result.target.agent = document.getElementById("query-target").value
    }

    const fromDiv = document.getElementById("query-from")
    if (document.getElementById("query-from-tag").value !== "") {
        fromDiv.disabled = false
        result.from = document.getElementById("query-from-tag").value
    } else {
        fromDiv.disabled = true
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