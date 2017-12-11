import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import acorn from 'acorn';
import escodegen from 'escodegen';

var count = 0;

function myPlugin( options = {} ) {
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
          preserveBlankLines: false
        }
      });
      //console.log(newCode);

      return { code: newCode, map: { version: 3, sources: [], mappings: '' } };
    }
  };
}

export default {
  input: 'src/main/ts/Plugin.ts',
  treeshake: false,
  output: {
    file: 'dist/searchreplace/plugin.js',
    format: 'iife',
    name: 'searchreplace',
    banner: '(function () {',
    footer: '})()'
  },
  plugins: [
    resolve(),
    typescript({
      include: [
        '../../**/*.ts'
      ]
    }),
    // myPlugin(),
    uglify({
      timings: true,
      mangle: {
        properties: true
      }
    })
  ]
};