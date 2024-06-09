/**
 *
 * @param signals to merge
 * @return signal which will abort when any of signals abort
 */
export function combineSignals(signals: AbortSignal[]):AbortSignal {
  const controller = new AbortController();
  signals.forEach((signal) => {
    if (!signal) {
      return;
    }

    signal.addEventListener(
      'abort',
      () => {
        controller.abort(signal.reason);
      },
      {once: true},
    );

    if (signal.aborted) {
      controller.abort(signal.reason);
    }
  });

  return controller.signal;
}
