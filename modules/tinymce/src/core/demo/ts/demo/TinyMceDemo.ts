import { Class, Insert, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';

import type { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const textarea = SugarElement.fromTag('textarea');
  Value.set(textarea, `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus commodo tellus vitae posuere maximus. Proin hendrerit viverra arcu, non hendrerit lorem posuere ac. Pellentesque faucibus, eros et blandit vehicula, nisl odio egestas quam, et hendrerit risus lorem nec nisl. Maecenas finibus ligula eu condimentum imperdiet. Sed sapien mi, iaculis sit amet nisi ac, sagittis aliquet nulla. Nam ac tempus sem. Vestibulum id cursus dui. Quisque at augue eget augue egestas faucibus sit amet in risus.</p>
<p>Fusce eu vulputate elit. Nulla at ultricies nulla. Nunc accumsan, dolor ac ullamcorper tempus, mauris ex finibus tortor, eget gravida lectus enim vitae purus. Cras semper, nisl a feugiat molestie, leo felis commodo purus, eu eleifend lectus tortor quis metus. Nulla tellus mauris, elementum et interdum iaculis, volutpat sed ex. Donec vehicula ultrices quam. Vivamus volutpat porttitor augue id varius. Mauris feugiat pellentesque urna. Pellentesque felis enim, gravida elementum cursus at, varius vel libero. Vivamus vel venenatis ex, ut pharetra augue. Nunc in ornare ligula, vel faucibus purus. Praesent nulla metus, pellentesque et pulvinar sed, vehicula placerat sapien. Aliquam condimentum vel augue vitae cursus. Fusce gravida elementum dolor, vel tristique turpis viverra a.</p>
<p>Donec in facilisis nisl. Donec gravida vel eros a vestibulum. Integer tincidunt lectus sit amet faucibus efficitur. Sed ultricies purus libero, ut eleifend dui bibendum vel. Nulla id vestibulum felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. In laoreet, purus et interdum congue, felis augue fringilla augue, ac feugiat risus odio vitae libero. Donec porttitor ipsum dui.</p>
<p>Donec gravida diam dapibus, hendrerit neque at, tincidunt nisl. Donec sit amet elit id lorem vehicula laoreet. Vivamus suscipit eu justo a venenatis. Fusce quis urna a ante scelerisque luctus. Suspendisse maximus lacus quis massa venenatis, vel consectetur dolor mollis. Suspendisse potenti. Phasellus eu faucibus nulla, pulvinar finibus turpis. Sed accumsan nulla id mattis dictum. Curabitur ipsum augue, ultricies id dolor ac, pharetra malesuada dui. Donec commodo volutpat sapien, eget auctor eros. Quisque gravida lacinia arcu, vitae sollicitudin lacus sodales nec. Proin vel dui elit. Donec fermentum ante sed libero posuere, non cursus ligula accumsan. Fusce dapibus maximus leo, sit amet auctor leo iaculis a. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<p>Aliquam volutpat mi sem, et mattis elit mollis in. Phasellus tempor erat ut aliquam egestas. Proin luctus efficitur erat ac eleifend. Sed ornare ullamcorper porttitor. Fusce bibendum purus turpis. Nulla a velit est. Aliquam at sem dui. Fusce at leo sit amet metus finibus molestie.</p>
<p>Ut mollis aliquam urna, at consectetur libero volutpat vel. In sagittis eleifend magna, quis fringilla ligula facilisis nec. Integer ut congue libero, sit amet pretium arcu. Fusce finibus ullamcorper arcu, et pretium nisi facilisis id. Donec feugiat non lorem non laoreet. Aenean quis dui quam. Nunc lorem mi, hendrerit ut tortor a, volutpat vulputate ex. Praesent eget interdum sem. Nulla tortor felis, fringilla a lorem vel, gravida molestie magna. Vivamus lobortis lobortis massa, eu tristique turpis malesuada eget. Quisque mattis eget leo fringilla hendrerit. Aliquam ipsum orci, dignissim vitae maximus vel, porttitor ut quam. Proin iaculis nulla sed iaculis dignissim. Nulla metus est, sollicitudin at nunc nec, ultrices iaculis ex.</p>
<p>Nullam cursus diam nibh, vitae gravida diam laoreet at. Suspendisse turpis nunc, finibus nec felis et, aliquam ultrices nisl. Ut dapibus pellentesque lacus vitae hendrerit. Vivamus mollis odio sed eros elementum congue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In tempus rutrum nunc a mollis. Quisque ut dui venenatis, imperdiet nulla eget, tristique ligula. Mauris quis lorem vel quam pharetra fringilla.</p>
<p>Nunc eget magna sodales, maximus nisi id, viverra est. Suspendisse mollis ac quam vitae vestibulum. Duis in felis sed nunc fermentum bibendum. Ut mollis justo vel elit bibendum varius. Nulla facilisi. Proin gravida eget lacus ac euismod. Vestibulum at nisi et nibh egestas hendrerit sit amet quis neque. Etiam convallis ligula vitae orci facilisis tristique. Duis vehicula turpis arcu, a consectetur mi interdum at. Donec at magna volutpat, eleifend eros a, fringilla mi. Curabitur non nisl ac ipsum rutrum fringilla sit amet vel sapien. Quisque finibus mi eu diam vehicula, a hendrerit nulla posuere.</p>
<table style="border-collapse: collapse; width: 200%; border-width: 1px;" border="1"><colgroup><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"></colgroup>
<tbody>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
<td>&nbsp;</td>
</tr>
</tbody>
</table>
<p>Donec a enim leo. Cras purus lacus, tempor mattis risus vel, consequat molestie est. Suspendisse sit amet nisi ullamcorper, venenatis lorem at, blandit nunc. Suspendisse tortor nunc, consequat porttitor elit quis, scelerisque dictum tellus. Donec nec dui sed ex vulputate euismod laoreet non felis. Donec fermentum porttitor lorem, in scelerisque mi posuere sit amet. Suspendisse ex erat, auctor eget est sit amet, facilisis egestas orci. Integer ullamcorper, leo quis dictum bibendum, arcu tellus mollis erat, nec efficitur turpis sapien eget ante. In laoreet ipsum sed fringilla euismod. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.</p>
<p>Nam mollis felis a nisi imperdiet commodo. Mauris vitae dui porta, tristique risus vel, pretium augue. Morbi id quam quis leo ultrices accumsan sit amet nec tellus. Nunc sollicitudin euismod magna sed vestibulum. Fusce ultricies eget nisi et fermentum. Integer a nisl ligula. Etiam aliquam lacus nec diam venenatis aliquam. In augue risus, eleifend egestas sollicitudin eget, lacinia non diam. Ut sed imperdiet ipsum. Nam nec pretium leo. Nulla consectetur gravida augue, at dictum neque iaculis ac.</p>
</textarea>`);
  Class.add(textarea, 'tinymce');
  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
  Insert.append(container, textarea);

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    setup: (ed) => {
      ed.ui.registry.addButton('demoButton', {
        text: 'Demo',
        onAction: () => {
          ed.insertContent('Hello world!');
        }
      });
    },

    selector: 'textarea',
    license_key: 'gpl',
    toolbar1: 'demoButton bold italic',
    menubar: false
  });
};
