import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;
function Flaky() {
  if (shouldThrow) throw new Error('boom');
  return <p>Recovered</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the default fallback after a render error', () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('resets and renders the children again when the fallback asks', () => {
    const onReset = vi.fn(() => {
      shouldThrow = false;
    });
    render(
      <ErrorBoundary onReset={onReset} fallback={(reset) => <button onClick={reset}>Retry</button>}>
        <Flaky />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
