configure({
  sources: [
    source('amd', 'tinymce.plugins.contextmenu', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/contextmenu\//, '');
    })
  ]
});
