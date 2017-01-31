configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.emoticons.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

