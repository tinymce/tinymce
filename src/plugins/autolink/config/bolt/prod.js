configure({
  sources: [
    source('amd', 'tinymce.plugins.autolink', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/autolink\//, '');
    })
  ]
});
