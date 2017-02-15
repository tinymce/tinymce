configure({
  sources: [
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat)),
    source('amd', 'tinymce.plugins.imagetools', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/imagetools\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical)
  ]
});
