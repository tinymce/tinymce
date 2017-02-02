configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.print.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/print\//, '');
		})
  ]
});

