configure({
  sources: [
    source('amd', 'tinymce.themes.modern', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/modern\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
