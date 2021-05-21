import { Maybes } from '@ephox/katamari';

import { Api, Attribute, Body, ModelNodeType, NodeTransforms, Path, PredicateFilter, PredicateFind } from 'ephox/slate-sugar/api/Main';

declare let tinymce: any;

tinymce.init({
  selector: '#ephox-ui',
  plugins: [ 'rtc' ],
  rtc_standalone: true,
  init_instance_callback: (editor) => {
    const api = Maybes.getOrDie(Api.getModelApi(editor));
    const root = Body.getBody(api);

    const [ p ] = PredicateFilter.descendants(api, root, ({ node }) =>
      ModelNodeType.isElement(api, node) ? node.type === 'p' : false);

    const div = Maybes.getOrDie(PredicateFind.closest(api, p, ({ node }) =>
      ModelNodeType.isElement(api, node) ? node.class === 'content' : false, (el) => el === root));

    const textLocs = PredicateFilter.descendants(api, p, ({ node }) => ModelNodeType.isText(api, node));
    const [ bye, hello ] = textLocs.reverse();
    const [ time ] = PredicateFilter.descendants(api, div, ({ node }) => ModelNodeType.isInline(api, node));
    const blocks = PredicateFilter.descendants(api, root, ({ node }) => ModelNodeType.isBlock(api, node));

    NodeTransforms.setPropsAtPath(api, Path.modelLocationToPath(api, p), { style: 'font-weight: bold' });
    blocks.forEach((loc) => NodeTransforms.setPropsAtPath(api, Path.modelLocationToPath(api, loc), { style: 'border: 1px solid green' }));
    NodeTransforms.setPropsAtPath(api, Path.modelLocationToPath(api, time), { style: 'font-size: 10px' });
    NodeTransforms.setPropsAtPath(api, Path.modelLocationToPath(api, bye), { forecolor: 'blue' });
    NodeTransforms.setPropsAtPath(api, Path.modelLocationToPath(api, hello), { forecolor: 'red' });

    const assertTrue = (title, v) => {
      if (v !== true) {
        throw new Error(title + ' fail');
      }
    };

    const equals = (obj1, obj2) => {
      return Object.keys(obj1)
        .concat(Object.keys(obj2))
        .every((key) => {
          return obj1[key] === obj2[key];
        });
    };

    const pPath = Path.modelLocationToPath(api, p);
    const test = (cb) => {
      const p = Maybes.getOrDie(Path.pathToModelLocation(api, pPath));
      cb(p);
    };

    Attribute.setByPath(api, pPath, 'prop1', '1');
    test((p) => assertTrue('get_1', Attribute.get(api, p.node, 'prop1') === '1'));
    test((p) => assertTrue('getAll_1', equals(Attribute.getAll(api, p.node), { style: 'border: 1px solid green', prop1: '1' })));

    Attribute.setAllByPath(api, pPath, { prop2: '2', prop3: '3' });
    test((p) => assertTrue('get_2', Attribute.get(api, p.node, 'prop2') === '2'));
    test((p) => assertTrue('getAll_2', equals(Attribute.getAll(api, p.node), { style: 'border: 1px solid green', prop1: '1', prop2: '2', prop3: '3' })));

    Attribute.removeByPath(api, pPath, 'prop1');
    test((p) => assertTrue('get_3', Attribute.get(api, p.node, 'prop1') === undefined));
    test((p) => assertTrue('getAll_3', equals(Attribute.getAll(api, p.node), { style: 'border: 1px solid green', prop2: '2', prop3: '3' })));

    Attribute.removeAllByPath(api, pPath, [ 'prop2', 'prop3' ]);
    test((p) => assertTrue('get_4', Attribute.get(api, p.node, 'prop2') === undefined));
    test((p) => assertTrue('getAll_4', equals(Attribute.getAll(api, p.node), { style: 'border: 1px solid green' })));
  }

});
