configure({
  sources: [
    source('amd', 'tinymce.plugins.noneditable', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/noneditable\//, '');
    })
  ]
});
