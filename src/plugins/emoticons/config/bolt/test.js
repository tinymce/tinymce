configure({
  configs: [
    './../../../../core/config/bolt/test.js'
  ],
  sources: [
    source('amd', 'tinymce.plugins.emoticons.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/emoticons\//, '');
    }),
    source('amd', 'tinymce.plugins.emoticons', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/emoticons\//, '');
    }),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
