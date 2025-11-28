import { Optional } from '@ephox/katamari';
import { Css, type SugarElement } from '@ephox/sugar';
import { useEscapeKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import React, { useRef } from 'react';

interface ItemProps {
  classes: string[];
}

export const Item = ({ classes }: ItemProps): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  useEscapeKeyNavigation({
    containerRef: ref,
    onEscape: (element: SugarElement<HTMLElement>): Optional<boolean> => {
      if (Css.get(element, 'box-shadow') === 'rgb(0, 0, 0) 0px -6px 6px 0px') {
        Css.set(element, 'box-shadow', '0 6px 6px #000');
      } else {
        Css.set(element, 'box-shadow', '0 -6px 6px #000');
      }

      return Optional.from(true);
    },
  });

  return (
    <span
      className={classes.join(' ')}
      ref={ref}
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
};