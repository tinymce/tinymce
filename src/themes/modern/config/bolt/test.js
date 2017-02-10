configure({
  configs: [
    './../../../../core/config/bolt/test.js'
  ],
  sources: [
    source('amd', 'tinymce.themes.modern.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/modern\//, '');
    }),
    source('amd', 'tinymce.themes.modern', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/modern\//, '');
    }),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
