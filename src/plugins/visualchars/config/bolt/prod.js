configure({
  sources: [
    source('amd', 'tinymce.plugins.visualchars', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/visualchars\//, '');
    }),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
