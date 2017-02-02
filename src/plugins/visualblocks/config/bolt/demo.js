configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.visualblocks.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/visualblocks\//, '');
		})
  ]
});

