configure({
  configs: [
    
  ],
  sources: [
    source('amd', 'tinymce.themes.mobile', '../../src/main/js', function (id) {
      return mapper.hierarchical(id).replace(/^tinymce\/themes\/mobile\//, '');
    }),
    source('amd', 'tinymce.core', '../../../../core/dist/globals', mapper.hierarchical),
    source('amd', 'ephox.alloy', '../../../../../../van/alloy/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boulder', '../../../../../../van/boulder/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.sugar', '../../../../../../van/sugar/src/main/js', mapper.hierarchical),

    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
