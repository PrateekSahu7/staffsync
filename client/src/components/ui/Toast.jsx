import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const ToastCtx = createContext(null);

// Use: const toast = useToast(); toast.success('Saved'); toast.error('Something went wrong');
export const useToast = () => useContext(ToastCtx);

const icons = { success: 'checkcircle', error: 'alert', info: 'info' };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback((kind, text) => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-3), { id, kind, text }]);
    setTimeout(() => remove(id), kind === 'error' ? 6500 : 3500);
  }, [remove]);

  const api = useMemo(() => ({
    success: (text) => push('success', text),
    error: (text) => push('error', text),
    info: (text) => push('info', text),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast-item ${t.kind}`}>
            <Icon name={icons[t.kind]} size={18} />
            <span className="toast-text">{t.text}</span>
            <button className="toast-close" aria-label="Dismiss" onClick={() => remove(t.id)}><Icon name="x" size={14} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
