
import { useEffect, useRef } from 'react';

import { useFlowKeyNavigation } from '../../../KeyboardNavigationHooks';
import { type Story } from '../FlowType.stories';

import { Container } from './Container';

export default {};
export const FlowKeyingWithoutCycles: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    useFlowKeyNavigation({
      containerRef: ref,
      selector: '.stay',
      cycles: false,
    });
    useEffect(() => {
      if (ref.current) {
        ref.current.querySelector<HTMLDivElement>('.stay')?.focus();
      }
    }, []);
    return (
      <Container ref={ref} testId='container' />
    );
  },
};
