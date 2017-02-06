configure({
  sources: [
    source('amd', 'tinymce.themes.modern', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/modern\//, '');
    })
  ]
});
