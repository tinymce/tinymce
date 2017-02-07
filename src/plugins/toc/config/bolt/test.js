configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.plugins.toc.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/toc\//, '');
    }),
    source('amd', 'tinymce.plugins.toc.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
