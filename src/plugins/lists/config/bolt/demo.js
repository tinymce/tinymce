configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.lists.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/lists\//, '');
		})
  ]
});