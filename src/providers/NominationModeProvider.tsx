import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
export type NominationMode = 'award' | 'acknowledgement';
const Context = createContext<{ mode: NominationMode | null; error: string; refresh: () => Promise<void> }>({ mode: null, error: '', refresh: async () => {} });
export function NominationModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NominationMode | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from('nomination_settings').select('mode').eq('id', true).single();
    if (error) { setError('Nomination settings could not be loaded. Please try again.'); setMode(null); }
    else { setMode(data.mode as NominationMode); setError(''); }
  }, []);
  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);
  return <Context.Provider value={{ mode, error, refresh }}>{children}</Context.Provider>;
}
export const useNominationMode = () => useContext(Context);
