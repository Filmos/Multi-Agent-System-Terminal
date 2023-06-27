define("app/syntax_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
    "use strict";

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var MASHighlightRules = function () {
        this.$rules = {
            "start": [
                { token: "comment", regex: "%.+" },
                { token: ["text", "keyword"], regex: "(^|\\W)(initially|after|causes|by|if|always)(?=\\s|$)" },
                { token: "constant.language.boolean", regex: "(\\s)(and|or|->)(?=\\s|$)" },
                { token: "variable.parameter", regex: "(?!-)(^|\\W)(-?[a-z]+)(?=\\s|$)" },
                { token: "text", regex: "{", next: "agents" },
                { token: "entity.name.function", regex: "(^|\\W)([A-Z_]+)(?=\\s|$)" }
            ],
            "agents": [
                { token: "storage.type", regex: "[a-z]+" },
                { token: "text", regex: "$|}", next: "start" }
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