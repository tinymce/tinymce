#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// The list of core and plugin files from prism to use in the prism.js bundle
const files = [
  'components/prism-core.js',

  'components/prism-clike.js',
  'components/prism-markup-templating.js',

  'components/prism-c.js',
  'components/prism-cpp.js',
  'components/prism-csharp.js',
  'components/prism-css.js',
  'components/prism-java.js',
  'components/prism-javascript.js',
  'components/prism-markup.js',
  'components/prism-php.js',
  'components/prism-python.js',
  'components/prism-ruby.js'
];

// Add the header to store any original Prism reference and to wrap the prism init in an IIFE
let content = `const prismjs = function(global, module, exports) {
// preserve the global if it has already been loaded
const oldprism = window.Prism;
window.Prism = { manual: true };
`;

const prismjs_location = path.dirname(require.resolve('prismjs'));

// Load in the core and any plugins/languages that should be used
files.forEach((file) => {
  content += fs.readFileSync(path.resolve(prismjs_location, file)).toString() + '\n';
});

// Restore the original reference and expose prism as an ES6 module
content += `// restore the original Prism reference
window.Prism = oldprism;
return Prism;
}(undefined, undefined, undefined);
export default prismjs;`

// Write the new prism.js file
fs.writeFileSync(path.resolve(prismjs_location, 'prism.js'), content);
