function parseDropdowns() {
    let result = {
        initial_state: new Set(),
        noninertial_fluents: new Set(),
        noninertial_rules_fluents: [],
        // noninertial_rules_actions: [],
        prohibitions: [],
        action_rules: [],
        action_execution: [],
    }

    result["initial_state"] = new Set(document.getElementById("dropdown-initial").value.split(",").map((x) => x.trim()).filter(f => f.length > 0 && f[0] != '-'))
    readGUI("dropdown-noninertial-fluents", (e) => {
        result["noninertial_fluents"].add(e.fluent[0] == '-' ? e.fluent.substring(1) : e.fluent)
        result["noninertial_rules_fluents"].push({ fluent: e.fluent, condition: e.condition })
    })
    // readGUI("dropdown-noninertial-actions", (e) => {
    //     result["noninertial_fluents"].add(e.fluent[0] == '-' ? e.fluent.substring(1) : e.fluent)
    //     result["noninertial_rules_actions"].push({ fluent: e.fluent, actions: e.actions.split(",").map((x) => x.trim()) })
    // })
    readGUI("dropdown-prohibitions", (e) => {
        result["prohibitions"].push({ action: e.action, condition: e.condition, agents: e.agents })
    })
    readGUI("dropdown-action-rules", (e) => {
        result["action_rules"].push({ action: e.action, effect: e.effect.split(",").map((x) => x.trim()), condition: e.condition, agents: e.agents })
    })
    readGUI("dropdown-action-execution", (e) => {
        result["action_execution"].push({ action: e.action, condition: e.condition, agents: e.agents.split(",").map((x) => x.trim()) })
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
    document.getElementById("dropdown-initial").innerText = Array.from(program["initial_state"].values()).join(", ")
    makeGUI("dropdown-noninertial-fluents", program["noninertial_rules_fluents"], (e) => ({ "fluent": e.fluent, "condition": e.condition }))
    // makeGUI("dropdown-noninertial-actions", program["noninertial_rules_actions"], (e) => ({ "fluent": e.fluent, "actions": e.actions.join(", ") }))
    makeGUI("dropdown-prohibitions", program["prohibitions"], (e) => ({ "action": e.action, "condition": e.condition, "agents": e.agents }))
    makeGUI("dropdown-action-rules", program["action_rules"], (e) => ({ "action": e.action, "effect": e.effect.join(", "), "condition": e.condition, "agents": e.agents }))
    makeGUI("dropdown-action-execution", program["action_execution"], (e) => ({ "action": e.action, "agents": e.agents.join(", ") }))
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