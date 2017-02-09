configure({
  configs: [
    './../../../../core/config/bolt/test.js'
  ],
  sources: [
    source('amd', 'tinymce.plugins.anchor.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
