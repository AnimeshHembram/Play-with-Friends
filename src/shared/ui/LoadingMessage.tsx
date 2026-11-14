/** A loading message that screen readers announce politely. */
export function LoadingMessage({ children = 'Loading…' }: { children?: string }) {
  return (
    <p className="placeholder" role="status">
      {children}
    </p>
  );
}
