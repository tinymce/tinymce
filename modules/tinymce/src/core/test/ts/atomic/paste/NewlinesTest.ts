import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';

import * as Newlines from 'tinymce/core/paste/Newlines';

describe('atomic.tinymce.core.paste.NewlinesTest', () => {
  it('isPlainText is true for text content', () => {
    Arr.each([
      {
        label: 'Basic Chrome markup (including span-wrapped tab)',
        content: '<div><span style="white-space:pre">  </span>a</div><div><br></div><div>b</div>',
      },
      {
        label: `Case shouldn't matter`,
        content: '<DIV>a</DIV><DIV><BR></DIV>',
      },
      {
        label: 'Support all BR types',
        content: '<br><br />',
      },
      {
        label: 'Basic IE markup',
        content: '<p>a</p><p><br></p><p>b</p>',
      },
      {
        label: 'White-space wrapper (Chrome)',
        content: '<div><span style="white-space: pre;"> </span>a</div>',
      }
    ], (c) => {
      assert.isTrue(Newlines.isPlainText(c.content), c.label);
    });
  });

  it('only DIV,P,BR and SPAN[style="white-space:pre"] tags are allowed in "plain text" string', () => {
    Arr.each([
      {
        label: 'White-space wrapper (Chrome) with additional styles is not plain text',
        content: '<div><span style="white-space: pre; color: red;"> </span>a</div>',
      },
      {
        label: 'Allowed tag but with attributes qualifies string as not plain text',
        content: '<br data-mce-bogus="all" />',
      },
      ...Arr.map(('a,abbr,address,article,aside,audio,b,bdi,bdo,blockquote,button,cite,' +
        'code,del,details,dfn,dl,em,embed,fieldset,figure,footer,form,h1,h2,h3,' +
        'h4,h5,h6,header,hgroup,hr,i,ins,label,menu,nav,noscript,object,ol,pre,' +
        'q,s,script,section,select,small,strong,style,sub,sup,svg,table,textarea,' +
        'time,u,ul,var,video,wbr').split(','), (tag) => {
        const content = `<p>a</p><${tag}>b</${tag}><p>c<br>d</p>`;
        return {
          label: `${tag.toUpperCase()} tag should qualify content (${content}) as not plain text`,
          content
        };
      })
    ], (c) => {
      assert.isFalse(Newlines.isPlainText(c.content), c.label);
    });
  });
});
