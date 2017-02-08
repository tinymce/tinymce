configure({
  sources: [
    source('amd', 'tinymce.plugins.charmap', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/charmap\//, '');
    })
  ]
});
