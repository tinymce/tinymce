import { Maybes } from '@ephox/katamari';

import { Api, Body, PredicateFilter, PredicateFind } from 'ephox/slate-sugar/api/Main';

declare let tinymce: any;

tinymce.init({
  selector: '#ephox-ui',
  plugins: [ 'rtc' ],
  rtc_standalone: true,
  init_instance_callback: (editor) => {
    const api = Api.getModelApi(editor).getOrDie();
    const root = Body.getBody(api);
    const [ p ] = Maybes.getOrDie(PredicateFilter.descendants(api, root, (el) => el.node.type === 'p'));
    const div = Maybes.getOrDie(PredicateFind.closest(api, p, (el) => el.node.class === 'content', (el) => el === root));
    void div;

  }

});

