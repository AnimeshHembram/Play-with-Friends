import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';

function DialogHarness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open rules</button>
      <Dialog
        open={open}
        title="How to play"
        description="Short rules"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <p>Rule one</p>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<DialogHarness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens with an accessible name and description', () => {
    render(<DialogHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open rules' }));
    const dialog = screen.getByRole('dialog', { name: 'How to play' });
    expect(dialog).toHaveAccessibleDescription('Short rules');
    expect(dialog).toHaveAttribute('open');
  });

  it('closes with the close button and returns focus to the opener', () => {
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Open rules' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes on Escape (the native cancel event)', () => {
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open rules' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('ConfirmDialog', () => {
  it('focuses the safe choice first and reports the answer', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Leave this game?"
        description="Progress will be lost."
        confirmLabel="Leave game"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('alertdialog', { name: 'Leave this game?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Leave game' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
