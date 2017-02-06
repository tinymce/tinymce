configure({
  sources: [
    source('amd', 'tinymce.plugins.autosave', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/autosave\//, '');
    })
  ]
});
