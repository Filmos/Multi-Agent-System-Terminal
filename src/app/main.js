define("app/main", ["require", "exports", "module", "app/syntax_highlight_rules"], function (require, exports, module) {
    "use strict";

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/MAS");
    editor.setOptions({
        showGutter: false,
        showPrintMargin: false,
    });
    editor.setValue(`% Noninertial rules
    noninertial fleeing
    -fleeing after -alive or dead
    -scared after LOAD, ATTACK

    % Initial state
    initially alive

    % Prohibition statements 
    impossible LOAD by deer

    % Action statements
    LOAD causes loaded by hunter
    ATTACK causes -alive, -ko-ko if loaded by hunter
    ATTACK causes -alive if (loaded or -sa_nity or -sa-sas) and alive by hunter
    ATTACK causes -loaded, -sanity by hunter

    % Actions execution
    LOAD by hunter
    ATTACK by hunter, dog, fox`.replace(/\n[ ]*/g, '\n'), -1)

    let lastTimeout = null;
    let ignoreNext = false;
    editor.session.on('change', function (delta) {
        if (lastTimeout) clearTimeout(lastTimeout);
        if (ignoreNext) { return }
        lastTimeout = setTimeout(formatProgram, 3500);
    });

    function parseProgram() {
        let result = {
            initial_state: new Set(),
            noninertial_fluents: new Set(),
            noninertial_rules_fluents: [],
            noninertial_rules_actions: [],
            prohibitions: [],
            action_rules: [],
            action_execution: [],
        }
        let text = editor.getValue();
        let lines = text.split('\n');

        for (let line of lines) {
            try {
                line = line.split('%')[0].trim();
                if (line.length == 0) continue;
                let keyword = line.split(' ')[0];

                const invalidLine = () => { throw "Invalid line" }
                if (keyword == 'initially') line.substring(keyword.length).split(',').map(f => f.trim()).filter(f => f.length > 0 && f[0] != '-').forEach(f => result['initial_state'].add(f));
                else if (keyword == 'noninertial') line.substring(keyword.length).split(',').map(f => f.trim()).filter(f => f.length > 0 && (f[0] != '-' || invalidLine())).forEach(f => result['noninertial_fluents'].add(f));
                else if (keyword == 'impossible') result['prohibitions'].push((r => ({ action: r[1], conditions: r[2], agents: r[3] }))(line.match(/^impossible\s+([A-Z_]*)\s+(?:if\s+(.+?)\s+)?(?:by\s+(.+?))?$/)));
                else if (line.match(/^(-?[a-z_]+)\s+after\s+([-()a-z_ ]+)$/)) result['noninertial_rules_fluents'].push((r => ({ fluent: r[1], condition: r[2] }))(line.match(/^(-?[a-z_]+)\s+after\s+([-()a-z_ ]+)$/)));
                else if (line.match(/^(-?[a-z_]+)\s+after\s+([A-Z_]+(?:.\s+[A-Z_]+))$/)) result['noninertial_rules_actions'].push((r => ({ fluent: r[1], actions: r[2].split(',').map(f => f.trim()) }))(line.match(/^(-?[a-z_]+)\s+after\s+([A-Z_]+(?:.\s+[A-Z_]+))$/)));
                else if (line.match(/^[A-Z_]*\s+causes\s/)) result['action_rules'].push((r => ({ action: r[1], effect: r[2].split(',').map(f => f.trim()), condition: r[3], agents: r[4] }))(line.match(/^([A-Z_]*)\s+causes\s+(.+?)\s+(?:if\s+(.+)\s+)?(?:by\s+(.+))/)));
                else if (line.match(/^[A-Z_]*\s+by\s/)) result['action_execution'].push((r => ({ action: r[1], agents: r[2].split(',').map(f => f.trim()) }))(line.match(/^([A-Z_]*)\s+by\s+(.+)/)));
                else invalidLine();
            } catch (e) {
                // TODO: underline the line, prevent formatting
                continue
            }

        }

        return result;
    }

    formatProgram();
    function formatProgram() {
        var result = parseProgram();
        console.log(result)
        var formatted = '';

        formatted += '% Initial state\n';
        if (result.initial_state.size > 0) formatted += 'initially ' + [...result.initial_state].join(', ') + '\n';

        formatted += '\n% Noninertial rules\n';
        if (result.noninertial_fluents.size > 0) formatted += 'noninertial ' + [...result.noninertial_fluents].join(', ') + '\n';
        formatted += result.noninertial_rules_fluents.map(r => r.fluent + ' after ' + r.condition).join('\n') + '\n';
        formatted += result.noninertial_rules_actions.map(r => r.fluent + ' after ' + r.actions.join(', ')).join('\n') + '\n';

        formatted += '\n% Prohibition statements\n';
        formatted += result.prohibitions.map(r => 'impossible ' + r.action + (r.conditions ? ' if ' + r.conditions : '') + (r.agents ? ' by ' + r.agents : '')).join('\n') + '\n';

        formatted += '\n% Action statements\n';
        formatted += result.action_rules.map(r => r.action + ' causes ' + r.effect.join(', ') + (r.condition ? ' if ' + r.condition : '') + (r.agents ? ' by ' + r.agents : '')).join('\n') + '\n';

        formatted += '\n% Actions execution\n';
        formatted += result.action_execution.map(r => r.action + ' by ' + r.agents.join(', ')).join('\n') + '\n';



        ignoreNext = true;
        setTimeout(() => { ignoreNext = false }, 100);

        let cursor = editor.getCursorPosition();
        editor.setValue(formatted, -1);
        editor.moveCursorToPosition(cursor);

        return result
    }

    exports.getParsedProgram = formatProgram;
});