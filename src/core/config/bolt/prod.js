configure({
  sources: [
    source('amd', 'tinymce.core', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
    })
  ]
});
