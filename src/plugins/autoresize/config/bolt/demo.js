configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.autoresize.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/autoresize\//, '');
		})
  ]
});

