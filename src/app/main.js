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
    -fleeing after (-alive or dead)
    -scared after LOAD, ATTACK
    -scared after LOAD, -alive

    % Initial state
    initially alive, -dead

    % Prohibition statements 
    impossible LOAD by deer
    impossible if loaded by deer

    % Action statements
    LOAD causes loaded by hunter
    ATTACK causes -alive, -ko-ko if loaded by hunter
    ATTACK causes -alive if (loaded or -sa_nity or -sa-sas) and alive by hunter
    ATTACK causes -loaded, -sanity by hunter

    % Actions execution
    LOAD by hunter
    ATTACK by hunter and (andog or fox)`.replace(/\n[ ]*/g, '\n'), -1)

    let lastTimeout = null;
    editor.session.on('change', function (delta) {
        if (lastTimeout) clearTimeout(lastTimeout);
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
                else if (line.match(/^[A-Z_]*\s+by\s/)) result['action_execution'].push((r => ({ action: r[1], agents: r[2] }))(line.match(/^([A-Z_]*)\s+by\s+(.+)/)));
                else invalidLine();
            } catch (e) {
                // TODO: underline the line, prevent formatting
                continue
            }

        }

        return result;
    }

    formatProgram();
    getParsedProgram = formatProgram;
    function formatProgram() {
        var result = parseProgram();
        console.log(result)
        // TODO: format program based on result
        return result
    }
});