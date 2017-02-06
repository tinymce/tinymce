configure({
  sources: [
    source('amd', 'tinymce.plugins.pagebreak', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/pagebreak\//, '');
    })
  ]
});
