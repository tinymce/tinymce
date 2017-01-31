configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.fullpage.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../tinymce')),
    source('amd', 'ephox', '../../../../../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
