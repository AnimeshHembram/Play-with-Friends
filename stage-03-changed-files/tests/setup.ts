import '@testing-library/jest-dom/vitest';

// jsdom does not implement the modal <dialog> API. Real browsers do (and the
// Playwright tests exercise the real thing); this keeps component tests honest
// about open/closed state without pretending to provide focus trapping.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
