function parseDropdowns() {
    let result = {
        initial_state: new Set(),
        action_rules: [],
        value_statements: [],
        domain_constraints: []
    }

    readGUI("dropdown-initial-state", (e) => {
        result["initial_state"].add(e.fluent)
    })
    readGUI("dropdown-domain-constraints", (e) => {
        result["domain_constraints"].push(e.constraint)
    })
    readGUI("dropdown-value-statements", (e) => {
        result["value_statements"].push({ fluent: e.fluent, actions: e.actions, agents: e.agents })
    })
    readGUI("dropdown-action-rules", (e) => {
        result["action_rules"].push({ action: e.action, effect: e.effect, condition: e.condition, agents: e.agents })
    })

    setProgram(result)
}

function readGUI(parent, callback) {
    parent = document.getElementById(parent)
    parent.querySelectorAll(".input-group:not(.d-none)").forEach(g => {
        const values = Object.fromEntries(Array.from(g.querySelectorAll("input")).map((e) => [("" + e.classList).match(/dropdown-([\w-]+)/)[1], e.value]))
        if (Object.values(values).filter(v => v.length > 0).length == 0) return
        callback(values)
    })
}



function fillDropdowns(program) {
    makeGUI("dropdown-initial-state", [...program["initial_state"]], (e) => ({ "fluent": e }))
    makeGUI("dropdown-domain-constraints", program["domain_constraints"], (e) => ({ "constraint": e }))
    makeGUI("dropdown-value-statements", program["value_statements"], (e) => ({ "fluent": e.fluent, "actions": e.actions, "agents": e.agents }))
    makeGUI("dropdown-action-rules", program["action_rules"], (e) => ({ "action": e.action, "effect": e.effect, "condition": e.condition, "agents": e.agents }))
}

function makeGUI(parent, source, mapping) {
    function makeRow(innerCode = () => { }) {
        let group = parent.querySelector(".input-group.d-none").cloneNode(true)
        group.classList.remove("d-none")
        innerCode(group)
        group.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", () => { parseDropdowns() })
        })
        parent.appendChild(group)
    }

    parent = document.getElementById(parent)
    parent.querySelectorAll(".input-group:not(.d-none)").forEach((g, i) => i < source.length ? null : g.remove())
    source.forEach((f, i) => {
        setValues = group => {
            Object.entries(mapping(f)).forEach(([k, v]) => {
                group.querySelector(".dropdown-" + k).value = v || ""
            })
        }
        target = parent.querySelectorAll(".input-group:not(.d-none)")[i]
        if (target) setValues(target)
        else makeRow(setValues)
    })
    makeRow()
}

document.querySelectorAll("#panel-dropdown textarea, #panel-dropdown input").forEach((input) => {
    input.addEventListener("input", () => {
        parseDropdowns()
    })
})

module.exports = { parseDropdowns, fillDropdowns }