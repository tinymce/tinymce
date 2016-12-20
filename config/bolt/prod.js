configure({
  sources: [
    source('amd', 'ephox.mcagar', '../../src/main/js', mapper.hierarchical),
    // I'm sure there is a better way to do this but the ent build looks for tinymce, so this gives it "tinymce"
    source('amd', 'ephox/tinymce', '../../src/main/libs', mapper.constant('EmptyTinymce')),
    source('amd', 'ephox', '../../node_modules/@ephox', mapper.repo('js', mapper.flat))
  ]
});
