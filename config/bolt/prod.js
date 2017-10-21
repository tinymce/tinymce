configure({
  sources: [
    source('amd', 'ephox.mcagar', '../../src/main/js', mapper.hierarchical),
    source('amd', 'tinymce', '../../node_modules/tinymce', mapper.constant('../../node_modules/tinymce/tinymce')),
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('src/main/js', mapper.hierarchical))
  ]
});
