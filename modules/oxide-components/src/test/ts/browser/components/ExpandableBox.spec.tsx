import { Fun } from '@ephox/katamari';
import { userEvent, type Locator } from '@vitest/browser/context';
import { ExpandableBox, type ExpandableBoxProps } from 'oxide-components/components/ExpandableBox/ExpandableBox';
import * as Bem from 'oxide-components/utils/Bem';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

describe('browser.ExpandableBoxTest', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className={Bem.block('tox')}>
        {children}
      </div>
    );
  };

  const defaultProps: ExpandableBoxProps = {
    expanded: false,
    onToggle: Fun.noop,
    maxHeight: 80,
    iconResolver: (icon: string) => `Icon: ${icon}`
  };

  const TestComponentToggle = (props: ExpandableBoxProps) => {
    const [ expanded, setExpanded ] = useState(false);

    return (
      <ExpandableBox
        {...props}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        {props.children}
      </ExpandableBox>
    );
  };

  const waitForElementText = async (getByText: (text: string) => Locator, text: string) => {
    await expect.poll(() => expect(getByText(text).element())).toBeTruthy();
  };

  it('Should be able to expand and collapse content that overflows', async () => {
    const TestComponent = () => {
      const [ expanded, setExpanded ] = useState(false);

      return (
        <ExpandableBox
          {...defaultProps}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        >
          <div style={{ height: '200px' }}>Hello world</div>
        </ExpandableBox>
      );
    };

    const { asFragment, getByText } = render(<TestComponent />, { wrapper });

    await waitForElementText(getByText, 'Expand');
    expect(asFragment()).toMatchSnapshot('1. Before expand click');

    await userEvent.click(getByText('Expand'));
    await waitForElementText(getByText, 'Collapse');
    expect(asFragment()).toMatchSnapshot('2. After expand click');

    await userEvent.click(getByText('Collapse'));
    await waitForElementText(getByText, 'Expand');
    expect(asFragment()).toMatchSnapshot('3. After collapse click');
  });

  it('Should not render expand if the content fits within maxHeight', async () => {
    const { asFragment } = render(
      <ExpandableBox
        {...defaultProps}
      >
        <div style={{ height: '50px' }}>Hello world</div>
      </ExpandableBox>,
      { wrapper }
    );

    expect(asFragment()).toMatchSnapshot('Content fits within maxHeight');
  });

  it('Should be able to set maxHeight, collapseText and expandText', async () => {
    const { asFragment, getByText } = render(
      <TestComponentToggle
        {...defaultProps}
        maxHeight={100}
        expandText="Show more"
        collapseText="Show less"
      >
        <div style={{ height: '150px' }}>Hello world</div>
      </TestComponentToggle>,
      { wrapper }
    );

    expect(asFragment()).toMatchSnapshot('1. Content fits within maxHeight');

    await userEvent.click(getByText('Show more'));
    await waitForElementText(getByText, 'Show less');
    expect(asFragment()).toMatchSnapshot('2. After show mode click');
  });
});
