configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.nonbreaking.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/nonbreaking\//, '');
		})
  ]
});

