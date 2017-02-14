configure({
  configs: [
  ],
  sources: [
    source('amd', 'ephox/imagetools', '../../../../node_modules/@ephox/imagetools/src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../../../node_modules/@ephox', mapper.repo('js', mapper.flat)),
    source('amd', 'tinymce.core.demo', '../../src/demo/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
    }),
    source('amd', 'tinymce.core', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
    }),
    source('amd', 'tinymce.plugins', '../../../plugins', function (id) {
      var parts = id.split('.');
      return parts.slice(2, 3).concat(['src/main/js']).concat(parts.slice(3)).join('/');
    }),
    source('amd', 'tinymce.themes', '../../../themes', function (id) {
      var parts = id.split('.');
      return parts.slice(2, 3).concat(['src/main/js']).concat(parts.slice(3)).join('/');
    })
  ]
});

