configure({
  sources: [
    source('amd', 'tinymce.plugins.toc', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/toc\//, '');
    })
  ]
});
