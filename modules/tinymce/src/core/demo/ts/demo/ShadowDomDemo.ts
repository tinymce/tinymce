declare let tinymce: any;

export default (init: ShadowRootInit) => {

  const shadowHost = document.getElementById('shadow-host');
  shadowHost.tabIndex = 1;

  const shadow = shadowHost.attachShadow(init);

  const node = document.createElement('textarea');
  node.value = 'here is some content';
  shadow.appendChild(node);

  tinymce.init({
    target: node,
    plugins: 'advlist charmap code codesample emoticons fullscreen image link lists media paste preview searchreplace table wordcount'
  });
};
