/**
 * Single place where unexpected errors are reported.
 * Today it logs to the console. A future error-reporting service would hook in here.
 */
export function reportError(error: unknown, context?: string): void {
  console.error(`[Play with Friends]${context ? ` ${context}:` : ''}`, error);
}
