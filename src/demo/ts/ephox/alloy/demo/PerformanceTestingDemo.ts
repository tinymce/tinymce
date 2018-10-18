import { Css, Height, SelectorFind, Width } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Pinching } from 'ephox/alloy/api/behaviour/Pinching';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { AlloySpec, AddEventsBehaviour } from '../../../../../main/ts/ephox/alloy/api/Main';
import { HTMLElement, document } from '@ephox/dom-globals';

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  const range = <A>(num: number, f: (i: number) => A): A[] => {
    const r: A[] = [];
    for (let i = 0; i < num; i++) {
      const g = f(i);
      r.push(g);
    }
    return r;
  }


  const buildNativeToDepth = (depth: number, numChildren: number): HTMLElement => {
    const div = document.createElement('div');
    const children = depth === 0 ? [ ] : range(numChildren, (_) => buildNativeToDepth(depth - 1, numChildren))
    for (let i = 0; i < children.length; i++) {
      div.appendChild(children[i]);
    }
    return div;
  }




  const buildToDepth = (depth: number, numChildren: number): AlloySpec => {
    return {
      dom: {
        tag: 'div'
      },
      components: depth === 0 ? [ ] : range(numChildren, (x) => {
        return buildToDepth(depth - 1, numChildren);
      }),
      // behaviours: Behaviour.derive([
      //   AddEventsBehaviour.config('blah', [])
      // ])
    }
  }
  console.time('spec');
  const spec = buildToDepth(4, 10);
  console.timeEnd('spec');
  console.log({ spec });


  const before = new Date().getTime();
  // console.time('build')
  // console.profile('build');
  const box = GuiFactory.build(spec);
  const after = new Date().getTime();
  console.log({ elapsed: after - before });
  // console.profileEnd('build');
  // console.timeEnd('build')


  // console.time('nativeBuild');
  // const nativeBox = buildNativeToDepth(4, 10);
  // console.timeEnd('nativeBuild');


  // console.time('add');
  // const gui = Gui.create();
  // gui.add(box);
  // console.timeEnd('add');


  // console.time('system');
  // Attachment.attachSystem(ephoxUi, gui);
  // console.timeEnd('system');
};