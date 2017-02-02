configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.directionality.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/directionality\//, '');
		})
  ]
});

