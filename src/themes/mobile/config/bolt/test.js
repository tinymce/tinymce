configure({
  configs: [
    './../../../../core/config/bolt/test.js'
  ],
  sources: [
    source('amd', 'tinymce.themes.mobile.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/mobile\//, '');
    }),
    source('amd', 'tinymce.themes.mobile', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/mobile\//, '');
    }),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox.alloy.test', '../../../../../node_modules/@ephox', mapper.repo('src/test/js/module', mapper.hierarchical)),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('src/main/js', mapper.hierarchical))
  ]
});
