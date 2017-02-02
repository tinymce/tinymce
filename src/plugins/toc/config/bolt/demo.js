configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.toc.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/toc\//, '');
		})
  ]
});

