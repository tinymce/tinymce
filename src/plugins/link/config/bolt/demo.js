configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.link.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/link\//, '');
		})
  ]
});

