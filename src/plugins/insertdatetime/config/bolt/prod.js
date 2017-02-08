configure({
  sources: [
    source('amd', 'tinymce.plugins.insertdatetime', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/insertdatetime\//, '');
    })
  ]
});
