var tinymce = require('./index.js');
module.exports = tinymce;

require('./plugins/autoresize/plugin.js');
require('./plugins/table/plugin.js');
require('./plugins/paste/plugin.js');
require('./plugins/noparsing/plugin.js');

module.exports.shopifyConfig.content_style = `
/**
 * Rich Text Editor
 * Manages style within the editor iframe
 **/

html, body {
  cursor: text;
}

body {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
}

h1, h2, h3, h4, h5, h6, p {
  margin: 0 0 1em 0;
  line-height: 1.4;
}

table {
  width: 100%;
}

table, td, th {
  border: 1px dashed #CCC;
}
`;
