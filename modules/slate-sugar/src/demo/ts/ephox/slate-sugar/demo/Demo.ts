import { Maybes } from '@ephox/katamari';

import { Api, Body, ModelNodeType, NodeTransforms, PredicateFilter, PredicateFind, SlateLoc } from 'ephox/slate-sugar/api/Main';

declare let tinymce: any;

tinymce.init({
  selector: '#ephox-ui',
  plugins: [ 'rtc' ],
  rtc_standalone: true,
  init_instance_callback: (editor) => {
    const api = Maybes.getOrDie(Api.getModelApi(editor));
    const root = Body.getBody(api);

    const [ p ] = Maybes.getOrDie(PredicateFilter.descendants(api, root, ({ node }) =>
      ModelNodeType.isElement(api, node) ? node.type === 'p' : false));

    const div = Maybes.getOrDie(PredicateFind.closest(api, p, ({ node }) =>
      ModelNodeType.isElement(api, node) ? node.class === 'content' : false, (el) => el === root));

    const textLocs = Maybes.getOrDie(PredicateFilter.descendants(api, p, ({ node }) => ModelNodeType.isText(api, node)));
    const [ bye, hello ] = textLocs.reverse();
    const [ time ] = Maybes.getOrDie(PredicateFilter.descendants(api, div, ({ node }) => ModelNodeType.isInline(api, node)));
    const blocks = Maybes.getOrDie(PredicateFilter.descendants(api, root, ({ node }) => ModelNodeType.isBlock(api, node)));

    NodeTransforms.setPropsAtPath(api, SlateLoc.toPathArray(api, p), { style: 'font-weight: bold' });
    blocks.forEach((loc) => NodeTransforms.setPropsAtPath(api, SlateLoc.toPathArray(api, loc), { style: 'border: 1px solid green' }));
    NodeTransforms.setPropsAtPath(api, SlateLoc.toPathArray(api, time), { style: 'font-size: 10px' });
    NodeTransforms.setPropsAtPath(api, SlateLoc.toPathArray(api, bye), { forecolor: 'blue' });
    NodeTransforms.setPropsAtPath(api, SlateLoc.toPathArray(api, hello), { forecolor: 'red' });
  }

});

