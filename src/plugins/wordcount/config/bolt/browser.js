configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.wordcount', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../../js/tinymce/tinymce')),
    source('amd', 'ephox', '../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
