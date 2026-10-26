import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ConfirmCtx = createContext(null);

// Use: const ask = useConfirm();
//   const answer = await ask({ title, message, confirmText, danger, input: 'placeholder' });
//   if (answer === null) return;   // cancelled. Otherwise answer is the typed text ('' if no input).
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { opts, resolve }
  const [value, setValue] = useState('');

  const ask = useCallback((opts) => new Promise((resolve) => {
    setValue('');
    setState({ opts, resolve });
  }), []);

  const close = (result) => {
    state.resolve(result);
    setState(null);
  };

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { state.resolve(null); setState(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  const o = state ? state.opts : {};

  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state && (
        <div className="backdrop" onClick={() => close(null)}>
          <form
            className="dialog" role="dialog" aria-modal="true" aria-label={o.title}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); close(o.input ? value : ''); }}
          >
            <h5 className="mb-2">{o.title}</h5>
            {o.message && <p className="text-muted mb-3">{o.message}</p>}
            {o.input && (
              <textarea
                className="form-control mb-3" rows="3" autoFocus placeholder={o.input}
                value={value} onChange={(e) => setValue(e.target.value)}
              />
            )}
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={() => close(null)}>Cancel</button>
              <button className={`btn ${o.danger ? 'btn-danger' : 'btn-primary'}`} autoFocus={!o.input}>
                {o.confirmText || 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
