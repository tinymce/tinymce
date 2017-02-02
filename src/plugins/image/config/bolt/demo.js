configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.image.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/image\//, '');
		})
  ]
});

