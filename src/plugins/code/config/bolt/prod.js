configure({
  sources: [
    source('amd', 'tinymce.plugins.code', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/code\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
