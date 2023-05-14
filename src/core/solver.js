function solve(program, query) {
    if (!query.target.fluent && !query.target.agent) throw new Error("No target specified")
    // TODO @Alu: Implement this
    console.log(program, query)
    return Math.random() > 0.5
}
module.exports = { solve }