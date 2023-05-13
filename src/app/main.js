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

});