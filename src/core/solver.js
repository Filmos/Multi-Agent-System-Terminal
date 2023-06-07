function solve(program, query) {
    if (!query.target.fluent && !query.target.agent) throw new Error("No target specified")
    // TODO @Alu: Implement this
    console.log(program, query)
    return Math.random() > 0.5
}

function makeGraph(program) {
    // TODO @Alu: Implement this
    var nodes = {}
    var actions = get_all_actions(program)
    var agents = get_all_agents(program)
    var states = get_all_states(program)
    states.forEach(element => {nodes[element.join(", ")]=element.join(", ")});

    states.forEach(state => {agents.forEach(agent => {actions.forEach(action => {choose_action(program,state,agent,action)
        
    });
        
    });
        
    });


    return {
        nodes: nodes,
        edges: [
            // { from: "a", to: "b", label: "KILL by hunter" },
            // { from: "a", to: "c", label: "RUN by deer" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "a", label: "STOP by deer" },
        ]
    }
}

function make_positive(fluent){
    if (fluent[0]=='-'){
        return fluent.slice(1)
    }
    return fluent
}
function make_negative(fluent){
    if (fluent[0]!='-'){
        return '-'+fluent
    }
    return fluent
}

const getAllSubsets = 
      theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
         subsets.map(set => [value,...set])
        ),
        [[]]
      );

function endComparator(a,b) {
    if (a.slice(-2) < b.slice(-2)) return -1;
    if (a.slice(-2) > b.slice(-2)) return 1;
    return 0;
}

function get_all_states(program){
    // get fluents from initial_state
    all_fluents = program.initial_state

    // get fluents from noninertial_fluents
    all_fluents = new Set([...all_fluents, ...program.noninertial_fluents]);

    // get fluents from noninertial_rules_fluents
    program.noninertial_rules_fluents.forEach(rule => {rule.condition.split(" and ").forEach(element_and => {element_and.split(" or ").forEach(element_and_or => {all_fluents.add(make_positive(element_and_or))
        });});});

    // get fluents from action_rules
    program.action_rules.forEach(element => {element.effect.forEach(effect => {all_fluents.add(make_positive(effect))
    });});
    program.action_rules.forEach(element => {
        if (typeof element.condition !== 'undefined'){
            element.condition.split(" and ").forEach(element_and => {element_and.split(" or ").forEach(element_and_or => {all_fluents.add(make_positive(element_and_or))
            });});
        }
        });
    
    // create all possible subsets
    var all_fluent_subsets = getAllSubsets(Array.from(all_fluents))
    all_fluent_subsets.forEach(subset => {all_fluents.forEach(fluent => {
        if(!subset.includes(fluent)){
            subset.push(make_negative(fluent))
        }
    });});
    all_fluent_subsets.forEach(element => {element.sort(endComparator)});
    console.log(all_fluent_subsets)
    return all_fluent_subsets
}

function get_all_agents(program){
    all_agents = new Set()
    // get agents from prohibitions
    program.prohibitions.forEach(prohib => {prohib.agents.split(', ').forEach(agent => {all_agents.add(agent)});});

    // get agents from action_rules
    program.action_rules.forEach(action => {action.agents.split(', ').forEach(agent => {all_agents.add(agent)});});

    // get agents from action_execution
    program.action_execution.forEach(action => {action.agents.forEach(agent => {all_agents.add(agent)});});
    all_agents = Array.from(all_agents)
    all_agents_subsets = getAllSubsets(all_agents)
    all_agents_subsets = all_agents_subsets.filter(element => element.length!=0)
    console.log(all_agents_subsets)
    return all_agents_subsets
}

function get_all_actions(program){
    all_actions = new Set()
    program.action_rules.forEach(rule => {all_actions.add(rule.action)});
    all_actions = Array.from(all_actions)
    console.log(all_actions)
    return all_actions
}

function choose_action(program, state, agents, action){
    console.log(state,agents,action)
}
module.exports = { solve, makeGraph }