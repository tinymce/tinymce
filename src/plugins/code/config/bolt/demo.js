configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.code.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/code\//, '');
		})
  ]
});

