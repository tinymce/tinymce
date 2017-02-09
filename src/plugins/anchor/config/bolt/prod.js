configure({
  sources: [
    source('amd', 'tinymce.plugins.anchor', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/anchor\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
