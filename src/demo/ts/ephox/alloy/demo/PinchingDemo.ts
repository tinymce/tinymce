import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Pinching from 'ephox/alloy/api/behaviour/Pinching';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import { Insert } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Height } from '@ephox/sugar';
import { Width } from '@ephox/sugar';



export default <any> function () {
  var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

  // Naive resize handler
  var resize = function (element, changeX, changeY) {
    var width = Css.getRaw(element, 'width').map(function (w) {
      return parseInt(w, 10);
    }).getOrThunk(function () {
      return Width.get(element);
    });

    var height = Css.getRaw(element, 'height').map(function (h) {
      return parseInt(h, 10);
    }).getOrThunk(function () {
      return Height.get(element);
    });

    Css.set(element, 'width', (width + changeX) + 'px');
    Css.set(element, 'height', (height + changeY) + 'px');
  };

  var box = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'demo-pinch-box' ],
      styles: {
        width: '200px',
        height: '200px',
        background: 'black'
      }
    },
    behaviours: Behaviour.derive([
      Pinching.config({
        onPinch: function (span, changeX, changeY) {
          resize(span, changeX, changeY);
        },
        onPunch: function (span, changeX, changeY) {
          resize(span, changeX, changeY);
        }
      })
    ])
  });

  var gui = Gui.create();
  gui.add(box);

  Attachment.attachSystem(ephoxUi, gui);
};