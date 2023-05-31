function solve(program, query) {
    if (!query.target.fluent && !query.target.agent) throw new Error("No target specified")
    // TODO @Alu: Implement this
    console.log(program, query)

    // finding literals in effects of actions
    // TODO @Alu: find literals in conditions of actions and noninertial
    if (query.target.type=='fluent'){
        current_state = program.initial_state
        for (let i = 0; i < program.action_rules.length; i++) {
            for (let j = 0; j < program.action_rules[i].effect.length; j++) {
                if(program.action_rules[i].effect[j][0]=='-'){
                    if (!current_state.has(program.action_rules[i].effect[j].slice(1))){
                        current_state.add(program.action_rules[i].effect[j])
                    }
                }
                else{
                    if (!current_state.has(program.action_rules[i].effect[j])){
                        current_state.add('-'+program.action_rules[i].effect[j])
                    }
                }
            }
        }
        let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

    for(let i = 0; i < program.action_execution.length; i++){
        current_action = program.action_execution[i]
        for(let j = 0; j < program.action_rules.length; j++){
            checked_action = program.action_rules[j]
            if (current_action.action==checked_action.action && current_action.agent==checked_action.agent){
                if (checked_action.condition!=undefined && checked_action.condition!=''){
                    current_conditions = new Set(checked_action.condition.split(' and '))
                }
                else{
                    current_conditions = new Set()
                }
                
                union = new Set([...current_state, ...current_conditions])
                if (areSetsEqual(union,current_state)){
                    for(let k = 0; k < checked_action.effect.length; k++){
                        if(!current_state.has(checked_action.effect[k])){
                            if(checked_action.effect[k][0]=='-'){
                                current_state.delete(checked_action.effect[k].slice(1))
                                current_state.add(checked_action.effect[k])
                            }else{
                                current_state.delete('-'+checked_action.effect[k])
                                current_state.add(checked_action.effect[k])
                            }
                        }
                    }
                }
            }
        }
        for(let j = 0; j < program.noninertial_rules_fluents.length; j++){
            if(current_state.has(program.noninertial_rules_fluents[j].condition)){
                console.log('AAAAA')
                if(program.noninertial_rules_fluents[j].fluent[0]=='-'){
                    current_state.delete(program.noninertial_rules_fluents[j].fluent.slice(1))
                    current_state.add(program.noninertial_rules_fluents[j].fluent)
                }else{
                    current_state.delete('-'+program.noninertial_rules_fluents[j].fluent)
                    current_state.add(program.noninertial_rules_fluents[j].fluent)
                }
            }
        }
    }
    console.log(current_state)
    return current_state.has(query.target.fluent)
    }
    console.log(current_state)
    return Math.random() > 0.5
}

function makeGraph(program) {
    // TODO @Alu: Implement this
    return {
        nodes: {
            "a": "-fleeing, -dead",
            "b": "-fleeing, dead",
            "c": "fleeing, -dead",
        },
        edges: [
            { from: "a", to: "b", label: "KILL by hunter" },
            { from: "a", to: "c", label: "RUN by deer" },
            { from: "c", to: "b", label: "KILL by hunter" },
            { from: "c", to: "a", label: "STOP by deer" },
        ]
    }
}
module.exports = { solve, makeGraph }