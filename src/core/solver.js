class InvalidQueryException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

function preprocess(program) {
    program = { ...program }

    program.value_statements = JSON.parse(JSON.stringify(program.value_statements))
    program.value_statements.forEach(exec => {
        exec.fluent = exec.fluent.split(",").map((x) => x.trim()).filter(x => x.length > 0)
        exec.actions = exec.actions.split(",").map((x) => x.trim()).filter(x => x.length > 0)
        exec.agents = exec.agents.split("}").map((x) => new Set(x.split(/[{,]/).map(y => y.trim()).filter(y => y.length > 0))).filter(x => x.size > 0)
    })

    program.action_rules = JSON.parse(JSON.stringify(program.action_rules))
    program.action_rules.forEach(exec => {
        exec.effect = exec.effect.split(",").map((x) => x.trim()).filter(x => x.length > 0)
        if (exec.condition)
            exec.condition = exec.condition.split(",").map((x) => x.trim()).filter(x => x.length > 0)
        exec.agents = new Set(exec.agents.split(",").map((x) => x.trim()).filter(x => x.length > 0))
    })
    return program
}

function preprocess_program(query){
    const pattern = /\((\w+),\s*\{\s*([^{}]*)\s*\}\s*\)/g;
    const matches = query.matchAll(pattern);
    const result = [];
  
    for (const match of matches) {
      const action = match[1];
      const agent = match[2].split(",").map((x) => x.trim()).filter(x => x.length > 0);
      result.push({action, agent});
    }
    
    return result;
  }

function solve(program, query) {
    program = preprocess(program)
    if (!query.target) throw new InvalidQueryException("No target specified")
    if (!query.actions) throw new InvalidQueryException("No program specified")
    states_fluents=get_all_states(program)
    agents=get_all_agents(program)
    actions=get_all_actions(program)
    query_tmp = preprocess_program(query.actions)
    console.log(program, query, query_tmp)
    var states = states_fluents[0]
    var fluents = states_fluents[1]

    potential_innitial_states = []
    states.forEach(state => {
        if(eqSet(new Set([...state].filter(x => program.initial_state.has(x))),program.initial_state)){
            potential_innitial_states.push(state)
        }
    })
    potential_innitial_states


    return false
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
        edge = make_edge(program,fluents,state,agent,action,states)
        if(typeof edge !== 'undefined'){
            edge=edge[0]
            edges.push(edge)}
    });});});
    tmp=edges
    edges.forEach(edge=>{
        if(edge==null){
            tmp={}
            nodes={}
        }
    })
    edges=tmp
    return {
        nodes:nodes,
        edges:edges
        // nodes: {a:'a',b:'b',c:'c'},
        // edges: 
        // [
        //     { from: "a", to: "b", label: "KILL by hunter" },
        //     { from: "a", to: "c", label: "RUN by deer" },
        //     { from: "c", to: "b", label: "KILL by hunter" },
        //     { from: "c", to: "b", label: "KILL by hunter" },
        //     { from: "c", to: "b", label: "KILL by hunter" },
        //     { from: "c", to: "a", label: "STOP by deer" },
        // ]
    }
}

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

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

    // get fluents from actions
    program.action_rules.forEach(element => {element.effect.forEach(effect => {all_fluents.add(make_positive(effect))});});
    program.action_rules.forEach(element => {
        if (typeof element.condition !== 'undefined'){
            element.condition.forEach(element_and => {all_fluents.add(make_positive(element_and))
            });
        }});

    // get fluents from always
    program.domain_constraints.forEach(constraint => {constraint.split(/ and | or | -> /).forEach(fluent => {all_fluents.add(make_positive(fluent))});});

    // get fluents from after
    program.value_statements.forEach(after => {after.fluent.forEach(fluent => {all_fluents.add(make_positive(fluent))});});

    // create all possible subsets
    var all_fluent_subsets = getAllSubsets(Array.from(all_fluents))
    all_fluent_subsets.forEach(subset => {all_fluents.forEach(fluent => {
        if(!subset.includes(fluent)){
            subset.push(make_negative(fluent))
        }
    });});

    // always
    all_fluent_subsets.forEach(element => {element.sort(endComparator)});
    constraints = new Set()
    program.domain_constraints.forEach(element => {
        tmp = element.replace(' and ', " && ").replace(' or ', " || ")
        if (tmp.includes("->")){
            tmp=tmp.split("->")
            tmp="!("+tmp[0]+")"+" || "+tmp[1]
        }
        constraints.add(tmp)
    });
    all_fluent_subsets=all_fluent_subsets.filter(subset => {
        tmp = true
        constraints.forEach(constraint => {
            tmp_constraint = constraint
            subset.forEach(fluent => {
                if(subset.includes(make_negative(fluent))){
                    tmp_constraint=tmp_constraint.replace(make_negative(fluent),'true')
                    tmp_constraint=tmp_constraint.replace(make_positive(fluent),'false')
                }
                else{
                    tmp_constraint=tmp_constraint.replace(make_negative(fluent),'false')
                    tmp_constraint=tmp_constraint.replace(make_positive(fluent),'true')
            }  
            });
            tmp_constraint = eval(tmp_constraint)
            tmp = (tmp && tmp_constraint)
        })
        return tmp
    })
    return [all_fluent_subsets,all_fluents]
}

function get_all_agents(program){
    program_agents = new Set()

    // get agents from actions
    program.action_rules.forEach(action => {action.agents.forEach(agent => {program_agents.add(agent)});});

    // get agents from after
    program.value_statements.forEach(statement => {statement.agents.forEach(agent => agent.forEach(element => {program_agents.add(element)}));});

    all_agents_subsets = getAllSubsets(Array.from(program_agents))
    
    //TODO: agents from value statements
    return all_agents_subsets
}

function get_all_actions(program){
    all_actions = new Set()
    program.action_rules.forEach(rule => {all_actions.add(rule.action)});
    all_actions = Array.from(all_actions)
    return all_actions
}

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function make_edge(program, fluents, state, agents, action, all_fluent_subsets){
    agent_subset_count=0
    choosen_actions = new Array()
    for (let index = 0; index < program.action_rules.length; index++) {
        needed_agents = program.action_rules[index].agents
        let intersection = new Set([...needed_agents].filter(x => new Set(agents).has(x)));
        condition = program.action_rules[index].condition
        if(typeof condition !== 'undefined'){
            condition=condition.join(' && ')
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
            condition=eval(condition)
        }
        else{
            condition=true
        }
        if(program.action_rules[index].action==action && intersection.size==needed_agents.size && condition){
            if(intersection.size==agent_subset_count){
                agent_subset_count=intersection.size
                choosen_actions.push(program.action_rules[index])
            }
            else if(intersection.size>agent_subset_count){
                agent_subset_count=intersection.size
                choosen_actions=new Array(program.action_rules[index])
            }
        }
    }
    possible_effects=new Set()
    choosen_actions.forEach(action => {action.effect.forEach(effect => {possible_effects.add(effect)})})

    Empty_effect = false
    possible_effects.forEach(effect => {
        if(effect == make_positive(effect)){
            if(possible_effects.has(make_negative(effect))){
                Empty_effect = true
            }
        }else{
            if(possible_effects.has(make_positive(effect))){
                Empty_effect = true
            }
        }
    })

    out_state=state
    possible_effects.forEach(effect => {
        if(effect == make_positive(effect)){
            if(out_state.includes(make_negative(effect))){
                out_state=arrayRemove(out_state,make_negative(effect))
                out_state.push(make_positive(effect))
            }
        }else{
            if(out_state.includes(make_positive(effect))){
                out_state=arrayRemove(out_state,make_positive(effect))
                out_state.push(make_negative(effect))
            }
        }
    })
    possible_state = false
    all_fluent_subsets.forEach(subset => {
        if(subset.toString()==out_state.sort(endComparator).toString()){
            possible_state=true
        }})

    if (choosen_actions.length==0  || !possible_state){
        return 
    }
    if (Empty_effect){
        return [null]
    }
    return [{from:state.sort(endComparator).join(", "),to:out_state.sort(endComparator).join(", "),label:action+" "+agents.join(", ")},false]
}
module.exports = { solve, makeGraph }