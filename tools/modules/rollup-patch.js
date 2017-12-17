const acorn = require('acorn');
const escodegen = require('escodegen');

var count = 0;

var escapeStr = function (str) {
  return str.replace(/[\u007f-\uffff]/g, function (ch) {
    var code = ch.charCodeAt(0).toString(16);
    if (code.length <= 2) {
        while (code.length < 2) code = '0' + code;
        return '\\x' + code;
    } else {
        while (code.length < 4) code = '0' + code;
        return '\\u' + code;
    }
  });
};

module.exports = function ( options = {} ) {
  return {
    transform ( code ) {
      var id = 'uuuid' + (count++);

      var ast = acorn.parse(code, {
        ecmaVersion: 8,
        sourceType: 'module',
        preserveParens: false,
        ranges: false
      });

      ast.body = ast.body.reduce((acc, node) => {
        if (node.type === 'ExportDefaultDeclaration') {
          var declaration = node.declaration;
          if (declaration.type === 'ObjectExpression') {
            return acc.concat([
              {
                'type': 'VariableDeclaration',
                'declarations': [
                  {
                    'type': 'VariableDeclarator',
                    'id': {
                      'type': 'Identifier',
                      'name': id
                    },
                    'init': declaration
                  }
                ],
                'kind': 'var'
              },
              {
                'type': 'ExportDefaultDeclaration',
                'declaration': {
                  'type': 'Identifier',
                  'name': id
                }
              }
            ]);
          }
        }

        return acc.concat([node]);
      }, []);

      let newCode = escodegen.generate(ast, {
        comment: true,
        format: {
          indent: {
              style: '',
              base: 0,
              adjustMultilineComment: false
          },
          newline: '',
          preserveBlankLines: false,
          safeConcatenation: true
        }
      });
      //console.log(newCode);

      return { code: escapeStr(newCode), map: { version: 3, sources: [], mappings: '' } };
    }
  };
}