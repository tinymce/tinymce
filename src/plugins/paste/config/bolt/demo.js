configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.paste.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/paste\//, '');
		})
  ]
});

