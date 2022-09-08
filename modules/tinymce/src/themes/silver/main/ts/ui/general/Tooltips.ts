import { AlloyComponent, GuiFactory, Tooltipping } from '@ephox/alloy';
import { Fun, Result } from '@ephox/katamari';

type TooltippingBehaviour = ReturnType<typeof Tooltipping['config']>;

// TODO: Consider using this once we fix the delayed attempt to appear after it's gone problem.

// FIX this with a proper design / architecture.
let numActiveTooltips = 0;

// TODO: Make the arrow configurable.
const upConfig = (item: { text: string }, getSink: () => Result<AlloyComponent, any>): TooltippingBehaviour => Tooltipping.config({
  delayForShow: () => numActiveTooltips > 0 ? 0 : 800,
  delayForHide: Fun.constant(800),
  exclusive: true,
  lazySink: getSink,
  /*
    <div class="tox-tooltip tox-tooltip--down">
<div class="tox-tooltip__body">Are you hanging on the edge of your seat? </div>
<i class="tox-tooltip__arrow"></i>
</div>*/
  tooltipDom: {
    tag: 'div',
    classes: [ 'tox-tooltip', 'tox-tooltip--up' ]
  },
  tooltipComponents: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-tooltip__body' ]
      },
      components: [
        GuiFactory.text(item.text)
      ]
    },
    {
      dom: {
        tag: 'i',
        classes: [ 'tox-tooltip__arrow' ]
      }
    }
  ],
  onShow: () => {
    numActiveTooltips++;
  },
  onHide: () => {
    numActiveTooltips--;
  }
});

export {
  upConfig
};
