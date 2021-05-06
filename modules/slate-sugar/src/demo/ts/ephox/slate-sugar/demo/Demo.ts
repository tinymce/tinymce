import { Maybes } from '@ephox/katamari';

import { Api, Body, NodeTransforms, PredicateFilter, PredicateFind, SlateLoc } from 'ephox/slate-sugar/api/Main';

declare let tinymce: any;

tinymce.init({
  selector: '#ephox-ui',
  plugins: [ 'rtc' ],
  rtc_standalone: true,
  init_instance_callback: (editor) => {
    const api = Api.getModelApi(editor).getOrDie();
    const root = Body.getBody(api);
    void Body.getEditor(api);

    const [ p ] = Maybes.getOrDie(PredicateFilter.descendants(api, root, (el) => el.node.type === 'p'));
    const div = Maybes.getOrDie(PredicateFind.closest(api, p, (el) => el.node.class === 'content', (el) => el === root));
    void div;

    const path = SlateLoc.toPathArray(api, p);
    NodeTransforms.setPropsAtPath(api, path, { style: 'font-weight: bold' });

  }

});

