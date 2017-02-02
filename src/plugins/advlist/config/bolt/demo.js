configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.advlist.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/advlist\//, '');
		})
  ]
});

