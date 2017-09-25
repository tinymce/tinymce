var tinymce = require('./tinymce.js');
module.exports = tinymce;

module.exports.shopifyConfig = {
  convert_urls: false,
  schema: 'html5',
  entity_encoding: 'raw',
  valid_children: '+body[style|meta],+div[meta],+object[object|param|embed],+a[span|h1|h2|h3|h4|h5|i|div|article|section|p]',
  valid_elements: '*[*]',
  extended_valid_elements: '#p[*]',
  force_p_newlines: true,
  forced_root_block: false,
  allow_html_in_named_anchor: true,
  prevent_list_wrap: true,
  browser_spellcheck: true
};
