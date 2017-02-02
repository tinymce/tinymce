configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.fullscreen.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/fullscreen\//, '');
		})
  ]
});

