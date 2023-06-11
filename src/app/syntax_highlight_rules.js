define("app/syntax_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var MASHighlightRules = function () {
        const common = [
            { token: "comment", regex: "%.+" },
            { token: "text", regex: "$", next: "start" },
        ]

        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used
        this.$rules = {
            "start": [
                ...common,
                { token: "keyword", regex: "^\\s*(?:noninertial|initially)", next: "raw_fluents" },
                { token: "keyword", regex: "^\\s*impossible", next: "action_impossible_pre" },
                { token: ["variable.parameter", "text", "keyword"], regex: "^(\\s*-?[a-z_]+)(\\s+)(after)", next: "fluents" },
                { token: "entity.name.function", regex: "^\\s*[A-Z_]+", next: "action_definition_or_invocation" }
            ],
            "raw_fluents": [
                ...common,
                { token: "variable.parameter", regex: "\\s[a-z_]+" }
            ],
            "fluents": [
                ...common,
                { token: ["text", "constant.language.boolean"], regex: "(\\W)(and|or)(?=\\s)" },
                { token: ["text", "variable.parameter"], regex: "(\\s|\\()(-?[a-z_]+)" }
            ],
            "raw_actions": [
                ...common,
                { token: "entity.name.function", regex: "\\s[A-Z_]+" }
            ],
            "action_definition_or_invocation": [
                ...common,
                { token: "keyword", regex: "causes", next: "action_causes" },
                { token: "keyword", regex: "by", next: "action_by" }
            ],
            "action_impossible_pre": [
                ...common,
                { token: "entity.name.function", regex: "[A-Z_]+", next: "action_impossible" }
            ],
            "action_impossible": [
                ...common,
                { token: "keyword", regex: "\\sif", next: "action_if" },
                { token: "keyword", regex: "\\sby", next: "action_by" }
            ],
            "action_causes": [
                ...common,
                { token: "keyword", regex: "\\sif", next: "action_if" },
                { token: "keyword", regex: "\\sby", next: "action_by" },
                { token: "variable.parameter", regex: "\\s-?[a-z_]+" }
            ],
            "action_if": [
                ...common,
                { token: "keyword", regex: "\\sby", next: "action_by" },
                { token: ["text", "constant.language.boolean"], regex: "(\\W)(and|or)(?=\\s)" },
                { token: ["text", "variable.parameter"], regex: "(\\s|\\()(-?[a-z_]+)" }
            ],
            "action_by": [
                ...common,
                { token: "storage.type", regex: "[a-z_]+" }
            ]
        };
    };

    oop.inherits(MASHighlightRules, TextHighlightRules);
    exports.MASHighlightRules = MASHighlightRules;
});
define("ace/mode/MAS", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "app/syntax_highlight_rules"], function (require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var MASHighlightRules = require("app/syntax_highlight_rules").MASHighlightRules;
    var Mode = function () {
        this.HighlightRules = MASHighlightRules;
    };
    oop.inherits(Mode, TextMode);
    exports.Mode = Mode;
});