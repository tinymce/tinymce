configure({
  sources: [
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical),
    source('amd', 'tinymce.plugins.imagetools.test', '../../src/test/js/module', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/imagetools\//, '');
    }),
    source('amd', 'tinymce.plugins.imagetools', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/plugins\/imagetools\//, '');
    }),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
