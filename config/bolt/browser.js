configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
  	source('amd', 'ephox/tinymce', '../../node_modules/tinymce', mapper.constant('../../node_modules/tinymce/tinymce'))
  ]
});
