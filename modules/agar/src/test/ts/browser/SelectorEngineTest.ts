import { afterEach, Assert, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { Insert, Remove, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as SelectorEngine from 'ephox/agar/alien/SelectorEngine';

describe('SelectorEngineTest', () => {
  const body = SugarElement.fromDom(document.body);
  let container: SugarElement<HTMLElement>;

  beforeEach(() => {
    container = SugarElement.fromHtml<HTMLElement>('<div class="container"></div>');
    Insert.append(body, container);
  });

  afterEach(() => {
    Remove.remove(container);
  });

  it('Should find element by id', async () => {
    const content = SugarElement.fromHtml(
      '<div>' +
        '<div class="myDiv"></div>' +
        '<div id="myDiv"></div>' +
        '<textarea></textarea>' +
      '</div>'
    );
    Insert.append(container, content);
    const divWithId = container.dom.querySelector('#myDiv');

    const matches = SelectorEngine.selectAll('#myDiv', container.dom);
    Assert.eq('one element in array', 1, matches.length);
    Assert.eq('div#myDiv returned', divWithId, matches[0], Testable.tStrict);
  });

  it('Should find element by class', async () => {
    const content = SugarElement.fromHtml(
      '<div>' +
        '<div class="myDiv"></div>' +
        '<div id="myDiv"></div>' +
        '<textarea></textarea>' +
      '</div>'
    );
    Insert.append(container, content);
    const divWithClass = container.dom.querySelector('.myDiv');

    const matches = SelectorEngine.selectAll('.myDiv', container.dom);
    Assert.eq('one element in array', 1, matches.length);
    Assert.eq('div.myDiv returned', divWithClass, matches[0], Testable.tStrict);
  });

  it('Should find element by tag', async () => {
    const content = SugarElement.fromHtml(
      '<div>' +
        '<div class="myDiv"></div>' +
        '<div id="myDiv"></div>' +
        '<textarea></textarea>' +
      '</div>'
    );
    Insert.append(container, content);
    const textarea = container.dom.querySelector('textarea');

    const matches = SelectorEngine.selectAll('textarea', container.dom);
    Assert.eq('one element in array', 1, matches.length);
    Assert.eq('textarea returned', textarea, matches[0], Testable.tStrict);
  });

  it('Should find element by contains', () => {
    const content = SugarElement.fromHtml(
      '<ul>' +
        '<li>One</li>' +
        '<li>Two</li>' +
        '<li>Three</li>' +
      '</ul>'
    );
    Insert.append(container, content);
    const secondLi = container.dom.querySelector('ul').children[1];

    let matches = SelectorEngine.selectAll('li:contains(Two)', container.dom);
    Assert.eq(':contains(Two) one element in array', 1, matches.length);
    Assert.eq(':contains(Two) second li returned', secondLi, matches[0], Testable.tStrict);

    matches = SelectorEngine.selectAll('li:contains(\'Two\')', container.dom);
    Assert.eq(':contains(\'Two\') one element in array', 1, matches.length);
    Assert.eq(':contains(\'Two\') second li returned', secondLi, matches[0], Testable.tStrict);

    matches = SelectorEngine.selectAll('li:contains("Two")', container.dom);
    Assert.eq(':contains("Two") one element in array', 1, matches.length);
    Assert.eq(':contains("Two") second li returned', secondLi, matches[0], Testable.tStrict);
  });

  it(':contains should be case sensitive', () => {
    const content = SugarElement.fromHtml(
      '<ul>' +
        '<li>One</li>' +
        '<li>Two</li>' +
        '<li>Three</li>' +
      '</ul>'
    );
    Insert.append(container, content);

    const matches = SelectorEngine.selectAll('li:contains(two)', container.dom);
    Assert.eq(':contains(two) should return empty array', 0, matches.length);
  });

  it(':contains should handle text with space', () => {
    const content = SugarElement.fromHtml('<ul><li>This is a sentence</li></ul>');
    Insert.append(container, content);
    const li = container.dom.querySelector('li');

    const matches = SelectorEngine.selectAll('li:contains(This is a sentence)', container.dom);
    Assert.eq(':contains(This is a sentence) one element in array', 1, matches.length);
    Assert.eq(':contains(This is a sentence) li returned', li, matches[0], Testable.tStrict);
  });

  it(':contains should handle text with parenthesis', () => {
    const content = SugarElement.fromHtml('<ul><li>English (United States)</li></ul>');
    Insert.append(container, content);
    const li = container.dom.querySelector('li');

    const matches = SelectorEngine.selectAll('li:contains("English (United States)")', container.dom);
    Assert.eq(':contains(English (United States)) one element in array', 1, matches.length);
    Assert.eq(':contains(English (United States)) li returned', li, matches[0], Testable.tStrict);
  });

  it(':contains should look in descendants', () => {
    const content = SugarElement.fromHtml(
      '<ol>' +
        '<li>Some text</li>' +
        '<li>' +
          '<ul>' +
            '<li>Some text</li>' +
            '<li><div id="tinyDiv">Tiny</div></li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );
    Insert.append(container, content);
    const ol = container.dom.querySelector('ol');

    const matches = SelectorEngine.selectAll('ol:contains(Tiny)', container.dom);
    Assert.eq(':contains(Tiny) one element in array', 1, matches.length);
    Assert.eq(':contains(Tiny) li returned', ol, matches[0], Testable.tStrict);
  });

  it(':contains should include partial match', () => {
    const content = SugarElement.fromHtml(
      '<ol>' +
        '<li>Tiny and couple of other words</li>' +
        '<li>TinyMCE</li>' +
        '<li>Tiny</li>' +
      '</ol>'
    );
    Insert.append(container, content);
    const liList = container.dom.querySelectorAll('li');

    const matches = SelectorEngine.selectAll('li:contains(Tiny)', container.dom);
    Assert.eq(':contains(Tiny) three elements in array', 3, matches.length);
    Assert.eq(':contains(Tiny) first li returned', liList[0], matches[0], Testable.tStrict);
    Assert.eq(':contains(Tiny) second li returned', liList[1], matches[1], Testable.tStrict);
    Assert.eq(':contains(Tiny) third li returned', liList[2], matches[2], Testable.tStrict);
  });

  it(':contains should include text divided between elements', () => {
    const content = SugarElement.fromHtml(
      '<p>' +
        'This is the only p' +
        '<span>ar</span>' +
        'agraph ' +
        '<em>here</em>' +
      '</p>'
    );
    Insert.append(container, content);
    const p = container.dom.querySelector('p');

    const matches = SelectorEngine.selectAll('p:contains("This is the only paragraph here")', container.dom);
    Assert.eq(':contains("This is the only paragraph here") one element in array', 1, matches.length);
    Assert.eq(':contains("This is the only paragraph here") p returned', p, matches[0], Testable.tStrict);
  });

  const assertThrowsContainsAtTheEnd = (selector: string) => {
    assert.throws(
      () => SelectorEngine.selectAll(selector, container.dom),
      `Invalid selector '${selector}'. ':contains' is only supported as the last pseudo-class.`
    );
    assert.throws(
      () => SelectorEngine.matchesSelector(container.dom, selector),
      `Invalid selector '${selector}'. ':contains' is only supported as the last pseudo-class.`
    );
  };

  it('Should throw :contains has to be at the end', () => {
    assertThrowsContainsAtTheEnd('label:contains(Foo) + input');
    assertThrowsContainsAtTheEnd('.tox-tbtn.tox-tbtn--select:has(.tox-tbtn__select-label:contains(test))');
  });

  it('matchesSelector should match', () => {
    const content = SugarElement.fromHtml(
      '<div id="home-content">' +
        '<section>' +
          '<p>This is my paragraph</p>' +
        '</section>' +
      '</div>'
    );
    Insert.append(container, content);
    const p = container.dom.querySelector('p');

    Assert.eq('matchesSelector should match', true, SelectorEngine.matchesSelector(p, '#home-content > section > p'));
  });

  it('matchesSelector should not match', () => {
    const content = SugarElement.fromHtml(
      '<div id="home-content">' +
        '<section>' +
          '<p>This is my paragraph</p>' +
        '</section>' +
      '</div>'
    );
    Insert.append(container, content);
    const p = container.dom.querySelector('p');

    Assert.eq('matchesSelector should not match', false, SelectorEngine.matchesSelector(p, 'main > section > p'));
  });

  it('matchesSelector should match with contains', () => {
    const content = SugarElement.fromHtml(
      '<div id="home-content">' +
        '<section>' +
          '<p>One</p>' +
          '<p>Two</p>' +
          '<p>Three</p>' +
        '</section>' +
      '</div>'
    );
    Insert.append(container, content);
    const p = Array.from(container.dom.querySelectorAll('p'))[1];

    Assert.eq('matchesSelector should match with contains', true, SelectorEngine.matchesSelector(p, 'p:contains(Two)'));
  });
});
