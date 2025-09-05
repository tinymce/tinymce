
import { Fun, Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';
import { useRef } from 'react';

import { useFlowKeyNavigation, type FlowKeyingProps } from '../../../KeyboardNavigationHooks';

interface ItemProps {
  classes: string[];
}

const Item = ({ classes }: ItemProps) =>
  (
    <span
      className={classes.join(' ')}
      style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '2px',
        border: '1px solid ' + (classes.includes('stay') ? 'blue' : 'yellow')
      }}
      tabIndex={-1}
    />
  );

const defaultExecute = (
  focused: SugarElement<HTMLElement>
): Optional<boolean> => {
  focused.dom.click();
  return Optional.some(true);

};

export const FlowTypeDemo: React.FC<Omit<FlowKeyingProps, 'containerRef'>> = ({
  selector,
  execute = defaultExecute,
  escape = Fun.constant(Optional.none()),
  allowVertical = true,
  allowHorizontal = true,
  cycles = true,
  focusIn = false,
  closest = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useFlowKeyNavigation({
    containerRef,
    selector,
    allowHorizontal,
    allowVertical,
    closest,
    cycles,
    escape,
    execute,
    focusIn
  });
  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}
      className='container'
      style={{
        background: 'white',
        width: '200px',
        height: '200px'
      }}
    >
      <Item classes={[ 'stay', 'one' ]} />
      <Item classes={[ 'stay', 'two' ]} />
      <Item classes={[ 'skip', 'three' ]} />
      <Item classes={[ 'skip', 'four' ]} />
      <Item classes={[ 'stay', 'five' ]} />
    </div>
  );
};
