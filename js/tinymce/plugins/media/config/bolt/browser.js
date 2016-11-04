configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.media.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox/tinymce', '', mapper.constant('../../../../../tinymce')),
    source('amd', 'ephox.mcagar', '../../lib/test', mapper.flat),
    source('amd', 'ephox', '../../lib/test', mapper.flat)
  ]
});
