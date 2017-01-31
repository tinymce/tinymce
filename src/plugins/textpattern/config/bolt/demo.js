configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.textpattern.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});

