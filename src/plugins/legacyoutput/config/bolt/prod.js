configure({
  sources: [
    source('amd', 'tinymce.plugins.legacyoutput', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/legacyoutput\//, '');
    })
  ]
});
