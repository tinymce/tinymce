configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.core.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
    }),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
