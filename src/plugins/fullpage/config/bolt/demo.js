configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.fullpage.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/fullpage\//, '');
		})
  ]
});

