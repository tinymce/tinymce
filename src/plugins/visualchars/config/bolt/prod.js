configure({
  sources: [
    source('amd', 'tinymce.plugins.visualchars', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/visualchars\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
