import { forwardRef } from 'react';

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
