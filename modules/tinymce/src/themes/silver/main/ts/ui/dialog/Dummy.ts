import { SimpleSpec } from '@ephox/alloy';

export const renderDummy = (): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'poc-container' ]
  },
  components: [
    {
      dom: {
        tag: 'input',
        classes: [ 'poc-input' ]
      }
    },
    {
      dom: {
        tag: 'button',
        classes: [ 'poc-button' ],
        innerHtml: 'Click me!'
      }
    }
  ]
});