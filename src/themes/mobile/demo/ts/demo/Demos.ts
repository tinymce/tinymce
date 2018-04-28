import Demo from './Demo';
import FormDemo from './FormDemo';
import SlidersDemo from './SlidersDemo';
import StylesMenuDemo from './StylesMenuDemo';

declare let window: any;

window.demos = {
  demo: Demo,
  formDemo: FormDemo,
  slidersDemo: SlidersDemo,
  stylesMenuDemo: StylesMenuDemo
};
