const acorn = require('acorn');
const escodegen = require('escodegen');

var count = 0;

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
                "type": "VariableDeclaration",
                "declarations": [
                  {
                    "type": "VariableDeclarator",
                    "id": {
                      "type": "Identifier",
                      "name": id
                    },
                    "init": declaration
                  }
                ],
                "kind": "var"
              },
              {
                "type": "ExportDefaultDeclaration",
                "declaration": {
                  "type": "Identifier",
                  "name": id
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

      return { code: newCode, map: { version: 3, sources: [], mappings: '' } };
    }
  };
}