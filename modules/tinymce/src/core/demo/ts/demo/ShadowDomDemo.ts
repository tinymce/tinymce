import { document } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {

  const shadowHost = document.getElementById('shadow-host');

  const shadow = shadowHost.attachShadow({ mode: 'open' });

  const node = document.createElement('textarea');
  node.value = 'here is some content';
  shadow.appendChild(node);

  tinymce.init({
    target: node
  });
}
