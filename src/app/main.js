define("app/main", ["require", "exports", "module", "app/syntax_highlight_rules"], function (require, exports, module) {
    "use strict";

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/MAS");
    editor.setOptions({
        showGutter: false,
        showPrintMargin: false,
    });
    editor.setValue(`initially alive
    initially -broken
    always running -> alive

    loaded after SHOOT by {hunter}
    LOAD causes loaded by {hunter}
    SHOOT causes -loaded by {hunter}
    SHOOT causes -alive if loaded, -broken by {hunter}
    `.replace(/\n[ ]*/g, '\n'), -1)

    let lastTimeout = null;
    let ignoreNext = false;
    editor.session.on('change', function (delta) {
        if (ignoreNext) { return }
        parseProgram()
    });

    function accelarateParse() { }

    setTimeout(parseProgram, 100);
    function parseProgram() {
        let result = {
            initial_state: new Set(),
            action_rules: [],
            value_statements: [],
            domain_constraints: []
        }
        let text = editor.getValue();
        let lines = text.split('\n');

        for (let line of lines) {
            try {
                line = line.split('%')[0].trim();
                if (line.length == 0) continue;
                let keyword = line.split(' ')[0];

                const invalidLine = () => { throw "Invalid line" }
                if (keyword == 'initially') line.substring(keyword.length).split(',').map(f => f.trim()).filter(f => f.length > 0).forEach(f => result['initial_state'].add(f));
                else if (line.match(/^always/)) result['domain_constraints'].push(line.match(/^always\s+(.+)/)[1]);
                else if (line.match(/^.+\s+after\s/)) result['value_statements'].push((r => ({ fluent: r[1], actions: r[2], agents: r[3] }))(line.match(/^(.+)\s+after\s+(.+?)\s+by\s+(.+)/)));
                else if (line.match(/^[A-Z_]*\s+causes\s/)) result['action_rules'].push((r => ({ action: r[1], effect: r[2], condition: r[3], agents: (r[4] || "").replace(/[{}]/g, '') }))(line.match(/^([A-Z_]*)\s+causes\s+(.+?)(?:\s+if\s+(.+?))?(?:\s+by\s+(.+))?\s*$/)));
                else invalidLine();
            } catch (e) {
                // TODO: underline the line, prevent formatting
                continue
            }

        }

        setProgram(result, false);
    }

    function formatProgram(result) {
        var formatted = '';

        formatted += [...result.initial_state].map(f => `initially ${f}\n`).join('');
        formatted += result.domain_constraints.map(r => 'always ' + r + '\n').join('');
        formatted += result.value_statements.map(r => r.fluent + ' after ' + r.actions + ' by ' + r.agents + '\n').join('');
        formatted += result.action_rules.map(r => r.action + ' causes ' + r.effect + (r.condition ? ' if ' + r.condition : '') + (r.agents ? ` by {${r.agents}}` : '') + '\n').join('');

        ignoreNext = true;
        setTimeout(() => { ignoreNext = false }, 100);

        let cursor = editor.getCursorPosition();
        editor.setValue(formatted, -1);
        editor.moveCursorToPosition(cursor);
    }

    exports.accelarateCodeParse = accelarateParse;
    exports.formatProgram = formatProgram;
});