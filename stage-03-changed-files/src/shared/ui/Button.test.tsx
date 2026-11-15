import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { TextField } from './TextField';

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button');
  });

  it('blocks clicks while busy but stays focusable and announces it', () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Saving
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Saving' });
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();
  });
});

describe('IconButton', () => {
  it('has an accessible name even though it shows only an icon', () => {
    render(<IconButton icon="help" label="How to play" />);
    expect(screen.getByRole('button', { name: 'How to play' })).toBeInTheDocument();
  });
});

describe('TextField', () => {
  it('links label, hint and error to the input', () => {
    render(<TextField label="Team name" hint="Keep it short." error="Too long." />);
    const input = screen.getByRole('textbox', { name: 'Team name' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Keep it short. Too long.');
  });
});
