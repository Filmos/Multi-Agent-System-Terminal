function solve(program, query) {
    if (!query.target.fluent && !query.target.agent) throw new Error("No target specified")
    // TODO @Alu: Implement this
    console.log(program, query)
    return Math.random() > 0.5
}

function makeGraph(program) {
    // TODO @Alu: Implement this
    var nodes = {}
    var edges = []
    var actions = get_all_actions(program)
    var agents = get_all_agents(program)
    states_fluents=get_all_states(program)
    var states = states_fluents[0]
    var fluents = states_fluents[1]
    states.forEach(element => {nodes[element.join(", ")]=element.join(", ")});

    states.forEach(state => {agents.forEach(agent => {actions.forEach(action => {
        edge = make_edge(program,fluents,state,agent,action)
        if(typeof edge !== 'undefined'){
            edges.push(edge)}
    });
        
    });
        
    });
    return {
        nodes: nodes,
        edges: edges
        //[
            // { from: "a", to: "b", label: "KILL by hunter" },
            // { from: "a", to: "c", label: "RUN by deer" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "b", label: "KILL by hunter" },
            // { from: "c", to: "a", label: "STOP by deer" },
        //]
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
    return [all_fluent_subsets,all_fluents]
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

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function make_edge(program, fluents, state, agents, action){
    
    for (let index = 0; index < program.prohibitions.length; index++) {

        let intersection = new Set([...new Set(program.prohibitions[index].agents.split(', '))].filter(x => new Set(agents).has(x)));
        if (program.prohibitions[index].action==action && intersection.size!=0) {
            return
            // return to the same node if impossible ????????
            // return {from:state.join(", "),to:state.join(", "),label:action+" "+agents.join(", ")}
        }
    }

    agent_subset_count=0
    for (let index = 0; index < program.action_rules.length; index++) {

        needed_agents = new Set(program.action_rules[index].agents.split(', '))
        let intersection = new Set([...needed_agents].filter(x => new Set(agents).has(x)));
        condition = program.action_rules[index].condition
        if(typeof condition !== 'undefined'){
            fluents.forEach(fluent => {
                if(state.includes("-"+fluent)){
                    condition=condition.replace("-"+fluent,'true')
                    condition=condition.replace(fluent,'false')
                }
                else{
                    condition=condition.replace("-"+fluent,'false')
                    condition=condition.replace(fluent,'true')
            }   
            });
            condition=condition.replace("and",'&&')
            condition=condition.replace("or",'||')
            condition=eval(condition)
            
        }
        else{
            condition=true
        }

        if(program.action_rules[index].action==action && 
            intersection.size==needed_agents.size && condition && intersection.size>agent_subset_count){
                agent_subset_count=intersection.size
                choosen_action=program.action_rules[index]
        }
    }
    out_state=state
    console.log(choosen_action)

    choosen_action.effect.forEach(effect => {
        out_state=arrayRemove(out_state,make_positive(effect))
        out_state=arrayRemove(out_state,make_negative(effect))
        out_state.push(effect)
    });

    program.noninertial_rules_fluents.forEach(rule => {
        if (out_state.includes(rule.condition)){
            out_state=arrayRemove(out_state,make_positive(rule.fluent))
            out_state=arrayRemove(out_state,make_negative(rule.fluent))
            out_state.push(rule.fluent)
        }
    });
    out_state=out_state.sort(endComparator)

    return {from:state.join(", "),to:out_state.join(", "),label:action+" "+agents.join(", ")}
}
module.exports = {solve, makeGraph}