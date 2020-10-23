declare let tinymce: any;

export default function (init: ShadowRootInit) {

  const shadowHost = document.getElementById('shadow-host');

  const shadow = shadowHost.attachShadow(init);

  const node = document.createElement('textarea');
  node.value = 'here is some content';
  shadow.appendChild(node);

  tinymce.init({
    target: node,
    plugins: 'advlist charmap code codesample emoticons fullscreen image link lists media paste preview searchreplace table wordcount'
  });
}
