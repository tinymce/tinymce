import { Attribute, SugarElement } from '@ephox/sugar';
import { userEvent } from '@vitest/browser/context';
import { Textarea, type Height } from 'oxide-components/components/textarea/Textarea.component';
import { classes } from 'oxide-components/utils/Styles';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

describe('Textarea', () => {

  it('Should grow and shrink as needed', async () => {

    const maxHeight: Height = {
      unit: 'rows',
      value: 4
    };
    const minHeight: Height = {
      unit: 'rows',
      value: 1
    };

    const lineOfText = 'Hello World! ';

    const TestComponent = () => {
      const [ value, setValue ] = useState('');
      return (
        <Textarea value={value} onInput={(e) => {
          setValue(e.currentTarget.value);
        }} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" style={{
          width: '120px'
        }} />
      );
    };
    const { getByTestId } = render(
      <TestComponent />,
      {
        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
              {children}
            </div>
          );
        },
      });
    const textareaLocator = getByTestId('textarea');
    const textareaElement = textareaLocator.element();
    const sugarTextarea = SugarElement.fromDom(textareaElement);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be initially the minHeight').toBe(`${minHeight.value}`);

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be 2 after typing').toBe('2');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be 4 after typing more').toBe('4');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should not grow more than 4 after typing more').toBe(`${maxHeight.value}`);

    await userEvent.clear(textareaLocator);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should shrink to minHeight after clearing').toBe(`${minHeight.value}`);
  });

  it('Should handle maxHeight and minHeight in pixels correctly', async () => {

    const maxHeight: Height = {
      unit: 'px',
      value: 120
    };
    const minHeight: Height = {
      unit: 'px',
      value: 50
    };

    const lineOfText = 'Hello World! ';

    const TestComponent = () => {
      const [ value, setValue ] = useState('');
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          width: '200px',
          border: '1px solid black',
          padding: '10px',
          boxSizing: 'border-box'
        }}>
          <Textarea value={value} onInput={(e) => {
            setValue(e.currentTarget.value);
          }} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" style={{
            width: '120px'
          }} />
        </div>
      );
    };

    const { getByTestId } = render(
      <TestComponent />,
      {
        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
              {children}
            </div>
          );
        },
      });

    const textareaLocator = getByTestId('textarea');
    const textareaElement = textareaLocator.element();
    const sugarTextarea = SugarElement.fromDom(textareaElement);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be initially resolved to 2').toBe(`${2}`);

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should stay at 2 after typing').toBe('2');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be 4 after typing more').toBe('4');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should not grow more than 5 after typing more').toBe(`${5}`);

    await userEvent.clear(textareaLocator);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should shrink to minHeight after clearing').toBe(`${2}`);
  });

  it('Should resolve rows to 1 initially if minHeight in px is smaller than lineHeight', () => {

    const maxHeight: Height = {
      unit: 'px',
      value: 120
    };
    const minHeight: Height = {
      unit: 'px',
      value: 20
    };

    const TestComponent = () => {
      const [ value, setValue ] = useState('');
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          width: '200px',
          border: '1px solid black',
          padding: '10px',
          boxSizing: 'border-box'
        }}>
          <Textarea value={value} onInput={(e) => {
            setValue(e.currentTarget.value);
          }} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" style={{
            width: '120px'
          }} />
        </div>
      );
    };

    const { getByTestId } = render(
      <TestComponent />,
      {
        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
              {children}
            </div>
          );
        },
      });

    const textareaLocator = getByTestId('textarea');
    const textareaElement = textareaLocator.element();
    const sugarTextarea = SugarElement.fromDom(textareaElement);
    expect(Attribute.get(sugarTextarea, 'rows'), 'Textarea rows should be initially resolved to 1').toBe(`${1}`);
  });
});
