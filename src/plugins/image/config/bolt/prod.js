configure({
  sources: [
    source('amd', 'tinymce.plugins.image', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/image\//, '');
    })
  ]
});
