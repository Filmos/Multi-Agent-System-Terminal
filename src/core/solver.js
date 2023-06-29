function preprocess(program) {
    program = { ...program }

    program.value_statements = JSON.parse(JSON.stringify(program.value_statements))
    program.value_statements.forEach(exec => {
        exec.actions = exec.actions.split(",").map((x) => x.trim()).filter(x => x.length > 0)
        exec.agents = exec.agents.split("}").map((x) => new Set(x.split(/[{,]/).map(y => y.trim()).filter(y => y.length > 0))).filter(x => x.size > 0)
    })

    program.action_rules = JSON.parse(JSON.stringify(program.action_rules))
    program.action_rules.forEach(exec => {
        exec.effect = exec.effect.split(",").map((x) => x.trim()).filter(x => x.length > 0)
    })
    return program
}

function solve(program, query) {
    program = preprocess(program)
    console.log(program, query)
    

    if (!query.target.fluent && !query.target.agent) throw new Error("No target specified")
    // TODO @Alu: Implement this
    states_fluents=get_all_states(program)
    console.log(states_fluents)
    return 42
    var states = states_fluents[0]
    var fluents = states_fluents[1]
    var final_score = 0

    console.log(program, query)
    if (query.tag=='') {
        initial_state = Array.from(program.initial_state);
        fluents.forEach(fluent => {
        if(!initial_state.includes(fluent)){
            initial_state.push(make_negative(fluent))
        }
    });
    initial_state = new Array(initial_state.sort(endComparator))
    } 
    else {
        if (typeof query.from === 'undefined' || query.from == '') {
            initial_state = states
        } 
        else {
            fixed_fluents = query.from.split(', ')
            unfixed_fluents = new Array()
            fluents.forEach(fluent => {if (!fixed_fluents.includes(fluent) && !fixed_fluents.includes(make_negative(fluent))) {unfixed_fluents.push(fluent)}});
            initial_state = getAllSubsets(unfixed_fluents).map(state => state.concat(fixed_fluents));
            initial_state.forEach(state => {fluents.forEach(fluent => {
                if (!state.includes(fluent) && !state.includes(make_negative(fluent))) {
                    state.push(make_negative(fluent))
                }});});
            initial_state.forEach(state => {state.sort(endComparator)});
        }
    }
    edges = new Array()
    edges_no_agent = new Array()
    final_states = new Array()
    final_labels = new Array()
    if (query.target.type == "fluent"){
        console.log(initial_state)
        initial_state.forEach(state => {program.action_execution.forEach(exec => {
            edge = make_edge(program,fluents,state,exec.agents,exec.action)
            if(typeof edge !== 'undefined'){
                edge=edge[0]
                edges.push(edge)
                state = edge.to.split(', ')
            }
            if (exec==program.action_execution[program.action_execution.length - 1]) {
                final_states.push(edges[edges.length - 1].to.split(', '))
            }
        });});
        final_states.forEach(state => {
            if (state.includes(query.target.fluent)) {
                final_score+=1
        }});
        final_score = final_score/final_states.length
        console.log(edges)
        if (query.tag=='' || query.tag=='necessary') {
            return final_score==1
        }
        else{
            return final_score>0
        }
    }
    else if (query.target.type == "active") {
        console.log(initial_state)
        initial_state.forEach(state => {
            flag = false
            program.action_execution.forEach(exec => {
            edge = make_edge(program,fluents,state,exec.agents,exec.action)
            if(typeof edge !== 'undefined'){
                edges.push(edge[0])
                console.log(edge)
                state = edge[0].to.split(', ')
                if (edge[0].label.includes(query.target.agent) && edge[1]==true) {
                    flag=true
                }
            }
            });
            if (flag) {
                flag = false
                final_score+=1
            }});
        console.log(final_score)
        final_score = final_score/initial_state.length
        console.log(edges)
        if (query.tag=='' || query.tag=='necessary') {
            return final_score==1
        }
        else{
            return final_score>0
        }
    } else {
        active_array = new Array()
        is_active=false
        console.log(initial_state)
        initial_state.forEach(state => {
            flag = false
            program.action_execution.forEach(exec => {
            edge = make_edge(program,fluents,state,exec.agents,exec.action)
            if(typeof edge !== 'undefined'){
                edges.push(edge[0])
                console.log(edge)
                state = edge[0].to.split(', ')
                if (edge[0].label.includes(query.target.agent) && edge[1]==true) {
                    flag=true
                }
            }
            });
            active_array.push(flag)
            if (flag) {
                flag = false
                final_score+=1
            }});
        initial_state.forEach(state => {
            flag = false
            program.action_execution.forEach(exec => {
            edge = make_edge(program,fluents,state,exec.agents.filter(agent => agent!=query.target.agent),exec.action)
            if(typeof edge !== 'undefined'){
                edges_no_agent.push(edge[0])
                console.log(edge)
                state = edge[0].to.split(', ')
                if (edge[0].label.includes(query.target.agent) && edge[1]==true) {
                    flag=true
                }
            }
            });
            if (flag) {
                flag = false
                final_score+=1
            }});
            console.log(active_array)
            console.log(edges)
            console.log(edges_no_agent)
            final_score=0
            counter=0
            for (let index = program.action_execution.length-1; index < edges.length; index=index+program.action_execution.length) {
                console.log(edges[index],edges_no_agent[index],active_array[counter])
                if(edges[index].to != edges_no_agent[index].to && active_array[counter]){
                    final_score+=1
                }
                counter+=1
            }
            
            final_score=final_score/initial_state.length
            console.log(final_score)
            if (query.tag=='' || query.tag=='necessary') {
                return final_score==1
            }
            else{
                return final_score>0
            }
    }
}

function makeGraph(program) {
    program = preprocess(program)

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
            edge=edge[0]
            edges.push(edge)}
    });});});
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
    all_fluents = new Set()
    program.initial_state.forEach(element => {all_fluents.add(make_positive(element))});

    // get fluents from action_rules
    program.action_rules.forEach(element => {element.effect.forEach(effect => {all_fluents.add(make_positive(effect))
    });});
    program.action_rules.forEach(element => {
        if (typeof element.condition !== 'undefined'){
            element.condition.split(" and ").forEach(element_and => {all_fluents.add(make_positive(element_and))
            });
        }});
    
    // create all possible subsets
    var all_fluent_subsets = getAllSubsets(Array.from(all_fluents))
    all_fluent_subsets.forEach(subset => {all_fluents.forEach(fluent => {
        if(!subset.includes(fluent)){
            subset.push(make_negative(fluent))
        }
    });});
    all_fluent_subsets.forEach(element => {element.sort(endComparator)});
    //console.log(all_fluent_subsets)
    // TODO: is initial state subset of every state
    return [all_fluent_subsets,all_fluents]
}

function get_all_agents(program){
    all_agents = new Set()

    // get agents from action_rules
    program.action_rules.forEach(action => {action.agents.split(', ').forEach(agent => {all_agents.add(agent)});});

    // get agents from action_execution
    program.action_execution.forEach(action => {action.agents.forEach(agent => {all_agents.add(agent)});});
    all_agents = Array.from(all_agents)
    all_agents_subsets = getAllSubsets(all_agents)
    all_agents_subsets = all_agents_subsets.filter(element => element.length!=0)
    //console.log(all_agents_subsets)
    
    //TODO: agents from value statements
    return all_agents_subsets
}

function get_all_actions(program){
    all_actions = new Set()
    program.action_rules.forEach(rule => {all_actions.add(rule.action)});
    all_actions = Array.from(all_actions)
    //console.log(all_actions)
    return all_actions
}

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function make_edge(program, fluents, state, agents, action){
    // prohibition
    for (let index = 0; index < program.prohibitions.length; index++) {

        let intersection = new Set([...new Set(program.prohibitions[index].agents.split(', '))].filter(x => new Set(agents).has(x)));
        if (program.prohibitions[index].action==action && intersection.size!=0) {
            return
            //return {from:state.join(", "),to:state.join(", "),label:action+" "+agents.join(", ")}
        }
    }

    agent_subset_count=0
    choosen_action = null
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
    //console.log(choosen_action)
    if (choosen_action == null){
        return [{from:state.join(", "),to:state.join(", "),label:action+" "+agents.join(", ")},false]
    }
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

    return [{from:state.join(", "),to:out_state.join(", "),label:action+" "+agents.join(", ")},condition]
}
module.exports = {solve, makeGraph}