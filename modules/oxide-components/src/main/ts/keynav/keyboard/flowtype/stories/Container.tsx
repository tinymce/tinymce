import { forwardRef } from 'react';

import { Item } from './Item';

export const Container = forwardRef<HTMLDivElement, { testId: string }>(({ testId }, ref) => (
  <div
    data-testid={testId}
    ref={ref}
    className="flow-keying-test"
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
));
