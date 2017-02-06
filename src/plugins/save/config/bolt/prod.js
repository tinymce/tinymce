configure({
  sources: [
    source('amd', 'tinymce.plugins.save', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/save\//, '');
    })
  ]
});
