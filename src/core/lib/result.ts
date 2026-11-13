/**
 * A small Result type for operations that can fail because of user input
 * (an empty player name, a duplicate, an invalid state transition).
 *
 * Convention used across the platform core:
 * - Expected, user-caused failures return `Result` so the UI can show a message.
 * - Programmer errors (calling a utility with impossible arguments) throw.
 */
export interface AppError<Code extends string = string> {
  readonly code: Code;
  readonly message: string;
}

export type Result<T, Code extends string = string> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: AppError<Code> };

export const ok = <T>(value: T): { readonly ok: true; readonly value: T } => ({ ok: true, value });

export const fail = <Code extends string>(
  code: Code,
  message: string,
): { readonly ok: false; readonly error: AppError<Code> } => ({
  ok: false,
  error: { code, message },
});
