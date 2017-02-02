configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.save.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/save\//, '');
		})
  ]
});

