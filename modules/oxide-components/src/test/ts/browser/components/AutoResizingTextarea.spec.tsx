import { userEvent } from '@vitest/browser/context';
import { AutoResizingTextarea } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextarea';
import type { Height } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextareaTypes';
import { classes } from 'oxide-components/utils/Styles';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

describe('browser.AutoResizingTextareaTest', () => {
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
        <AutoResizingTextarea value={value} onChange={setValue} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" />
      );
    };
    const { getByTestId } = render(
      <TestComponent />,
      {

        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
              }}>
                <div style={{
                  width: '120px'
                }}>
                  {children}
                </div>
              </div>
            </div>
          );
        },
      });
    const textareaLocator = getByTestId('textarea');
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be initially the minHeight'
    }).toHaveAttribute('rows', `${minHeight.value}`);

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be 2 after typing'
    }).toHaveAttribute('rows', '2');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be 4 after typing more'
    }).toHaveAttribute('rows', '4');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should not grow more than 4 after typing more'
    }).toHaveAttribute('rows', '4');

    await userEvent.clear(textareaLocator);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should shrink to minHeight after clearing'
    }).toHaveAttribute('rows', `${minHeight.value}`);
  });

  it('Should handle maxHeight and minHeight in pixels correctly', async () => {

    const maxHeight: Height = {
      unit: 'px',
      value: 172
    };
    const minHeight: Height = {
      unit: 'px',
      value: 50
    };

    const lineOfText = 'Hello World! ';

    const TestComponent = () => {
      const [ value, setValue ] = useState('');
      return (
        <AutoResizingTextarea value={value} onChange={setValue} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" />
      );
    };

    const { getByTestId } = render(
      <TestComponent />,
      {
        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
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
                <div style={{
                  width: '120px'
                }}>
                  {children}
                </div>
              </div>
            </div>
          );
        },
      });

    const textareaLocator = getByTestId('textarea');
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be initially resolved to 2'
    }).toHaveAttribute('rows', '2');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should stay at 2 after typing'
    }).toHaveAttribute('rows', '2');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be 4 after typing more'
    }).toHaveAttribute('rows', '4');

    await userEvent.type(textareaLocator, lineOfText + lineOfText);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should not grow more than 5 after typing more'
    }).toHaveAttribute('rows', `${5}`);

    await userEvent.clear(textareaLocator);
    await expect.element(textareaLocator, {
      message: 'Textarea rows should shrink to minHeight after clearing'
    }).toHaveAttribute('rows', `${2}`);
  });

  it('Should resolve rows to 1 initially if minHeight in px is smaller than lineHeight', async () => {

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
        <AutoResizingTextarea value={value} onChange={setValue} maxHeight={maxHeight} minHeight={minHeight} data-testid="textarea" />
      );
    };

    const { getByTestId } = render(
      <TestComponent />,
      {
        wrapper: ({ children }) => {
          return (
            <div className={classes([ 'tox' ])}>
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
                <div style={{
                  width: '120px'
                }}>
                  {children}
                </div>
              </div>
            </div>
          );
        },
      });

    const textareaLocator = getByTestId('textarea');
    await expect.element(textareaLocator, {
      message: 'Textarea rows should be initially resolved to 1'
    }).toHaveAttribute('rows', `${1}`);
  });
});
