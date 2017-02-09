configure({
  configs: [
    './../../../../core/config/bolt/demo.js'
  ],
  sources: [
    source('amd', 'tinymce.plugins.code.demo', '../../src/demo/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/code\//, '');
    }),
    source('amd', 'tinymce.plugins.code', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/code\//, '');
    })
  ]
});

