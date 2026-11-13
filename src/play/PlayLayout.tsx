import { Outlet } from 'react-router';

/**
 * Shell for the gaming experience (everything under /play).
 * Shared chrome for the game side (header, exit, settings) will live here.
 */
export function PlayLayout() {
  return (
    <div className="play-shell">
      <Outlet />
    </div>
  );
}
