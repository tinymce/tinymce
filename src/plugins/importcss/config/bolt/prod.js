configure({
  sources: [
    source('amd', 'tinymce.plugins.importcss', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/importcss\//, '');
    })
  ]
});
