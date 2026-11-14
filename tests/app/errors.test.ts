import { installGlobalErrorHandlers } from '@/app/errors';

describe('global error handlers', () => {
  it('reports unhandled promise rejections and window errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const target = new EventTarget() as unknown as Window;
    installGlobalErrorHandlers(target);

    const rejection = new Event('unhandledrejection') as Event & { reason?: unknown };
    rejection.reason = new Error('lost promise');
    target.dispatchEvent(rejection);

    const error = new Event('error') as Event & { error?: unknown; message?: string };
    error.error = new Error('script error');
    target.dispatchEvent(error);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0]?.[0]).toMatch(/unhandled promise rejection/);
    expect(spy.mock.calls[1]?.[0]).toMatch(/window error/);
  });
});
