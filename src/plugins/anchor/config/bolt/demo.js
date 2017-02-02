configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.anchor.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/anchor\//, '');
		})
  ]
});

