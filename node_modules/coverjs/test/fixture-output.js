if (typeof __$coverObject === "undefined"){
	if (typeof window !== "undefined") window.__$coverObject = {};
	else if (typeof global !== "undefined") global.__$coverObject = {};
	else throw new Error("cannot find the global scope");
}
__$coverObject["test/fixture.js"] = {};
__$coverObject["test/fixture.js"].__code = "\"use strict\";\n\nvar a = 1;\nvar b = 3;\n\nvar esprima = require('esprima');\nvar escodegen = require('escodegen');\n\nfunction c(a, b){\n\treturn a + b;\n}\n\nif (b){\n\ta++;\n} else {\n\tb--;\n}\n\nvar d = function(){\n\tconsole.warn('bar');\n};\n\nswitch (a){\n\tcase 1:\n\t\tc(a, b);\n\t\tc(a, c(a, b));\n\t\tbreak;\n\tcase 2: c(b, a); break;\n}\n\nc(3, 4);\nc(5, 2);\n\nfunction Cover(){\n\n}\n\nCover.prototype = {\n\n\tparse: function(){\n\t\treturn (this.ast = esprima.parse(this.code, {\n\t\t\trange: true\n\t\t}));\n\t},\n\n\tgenerate: function(ast){\n\t\treturn escodegen.generate(ast);\n\t},\n\n\twalk: function(ast, index, parent){\n\t\tconsole.warn('foo bar');\n\t\tconsole.warn('yello');\n\t}\n\n};\n\ntry {\n\tthrow new Error('whops');\n\n\tconsole.warn('not here!');\n\n} catch (e){\n\tconsole.warn(e);\n\tconsole.warn(e);\n} finally {\n\tconsole.warn('finally'); console.warn('more finally');\n}\n\n\n";
__$coverObject["test/fixture.js"]["0:12"] = 0;
__$coverObject["test/fixture.js"]["15:24"] = 0;
__$coverObject["test/fixture.js"]["26:35"] = 0;
__$coverObject["test/fixture.js"]["38:70"] = 0;
__$coverObject["test/fixture.js"]["72:108"] = 0;
__$coverObject["test/fixture.js"]["111:144"] = 0;
__$coverObject["test/fixture.js"]["147:176"] = 0;
__$coverObject["test/fixture.js"]["179:222"] = 0;
__$coverObject["test/fixture.js"]["225:308"] = 0;
__$coverObject["test/fixture.js"]["311:318"] = 0;
__$coverObject["test/fixture.js"]["320:327"] = 0;
__$coverObject["test/fixture.js"]["330:349"] = 0;
__$coverObject["test/fixture.js"]["352:627"] = 0;
__$coverObject["test/fixture.js"]["630:810"] = 0;
__$coverObject["test/fixture.js"]["130:142"] = 0;
__$coverObject["test/fixture.js"]["156:159"] = 0;
__$coverObject["test/fixture.js"]["171:174"] = 0;
__$coverObject["test/fixture.js"]["200:219"] = 0;
__$coverObject["test/fixture.js"]["248:255"] = 0;
__$coverObject["test/fixture.js"]["259:272"] = 0;
__$coverObject["test/fixture.js"]["276:281"] = 0;
__$coverObject["test/fixture.js"]["292:299"] = 0;
__$coverObject["test/fixture.js"]["301:306"] = 0;
__$coverObject["test/fixture.js"]["395:461"] = 0;
__$coverObject["test/fixture.js"]["496:526"] = 0;
__$coverObject["test/fixture.js"]["572:595"] = 0;
__$coverObject["test/fixture.js"]["599:620"] = 0;
__$coverObject["test/fixture.js"]["637:661"] = 0;
__$coverObject["test/fixture.js"]["665:690"] = 0;
__$coverObject["test/fixture.js"]["707:722"] = 0;
__$coverObject["test/fixture.js"]["725:740"] = 0;
__$coverObject["test/fixture.js"]["755:778"] = 0;
__$coverObject["test/fixture.js"]["780:808"] = 0;
__$coverObject['test/fixture.js']['0:12']++;
'use strict';
__$coverObject['test/fixture.js']['15:24']++;
var a = 1;
__$coverObject['test/fixture.js']['26:35']++;
var b = 3;
__$coverObject['test/fixture.js']['38:70']++;
var esprima = require('esprima');
__$coverObject['test/fixture.js']['72:108']++;
var escodegen = require('escodegen');
__$coverObject['test/fixture.js']['111:144']++;
function c(a, b) {
    __$coverObject['test/fixture.js']['130:142']++;
    return a + b;
}
__$coverObject['test/fixture.js']['147:176']++;
if (b) {
    __$coverObject['test/fixture.js']['156:159']++;
    a++;
} else {
    __$coverObject['test/fixture.js']['171:174']++;
    b--;
}
__$coverObject['test/fixture.js']['179:222']++;
var d = function () {
    __$coverObject['test/fixture.js']['200:219']++;
    console.warn('bar');
};
__$coverObject['test/fixture.js']['225:308']++;
switch (a) {
case 1:
    __$coverObject['test/fixture.js']['248:255']++;
    c(a, b);
    __$coverObject['test/fixture.js']['259:272']++;
    c(a, c(a, b));
    __$coverObject['test/fixture.js']['276:281']++;
    break;
case 2:
    __$coverObject['test/fixture.js']['292:299']++;
    c(b, a);
    __$coverObject['test/fixture.js']['301:306']++;
    break;
}
__$coverObject['test/fixture.js']['311:318']++;
c(3, 4);
__$coverObject['test/fixture.js']['320:327']++;
c(5, 2);
__$coverObject['test/fixture.js']['330:349']++;
function Cover() {
}
__$coverObject['test/fixture.js']['352:627']++;
Cover.prototype = {
    parse: function () {
        __$coverObject['test/fixture.js']['395:461']++;
        return this.ast = esprima.parse(this.code, {
            range: true
        });
    },
    generate: function (ast) {
        __$coverObject['test/fixture.js']['496:526']++;
        return escodegen.generate(ast);
    },
    walk: function (ast, index, parent) {
        __$coverObject['test/fixture.js']['572:595']++;
        console.warn('foo bar');
        __$coverObject['test/fixture.js']['599:620']++;
        console.warn('yello');
    }
};
__$coverObject['test/fixture.js']['630:810']++;
try {
    __$coverObject['test/fixture.js']['637:661']++;
    throw new Error('whops');
    __$coverObject['test/fixture.js']['665:690']++;
    console.warn('not here!');
} catch (e) {
    __$coverObject['test/fixture.js']['707:722']++;
    console.warn(e);
    __$coverObject['test/fixture.js']['725:740']++;
    console.warn(e);
} finally {
    __$coverObject['test/fixture.js']['755:778']++;
    console.warn('finally');
    __$coverObject['test/fixture.js']['780:808']++;
    console.warn('more finally');
}