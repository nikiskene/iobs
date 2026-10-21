import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
import {useAuth} from './useAuth';
export function useBeauAccess(){
 const {user,profile}=useAuth();
 const userId=user?.id, active=profile?.is_active;
 const [allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let current=true;
  async function refresh(){
   if(!userId||!active){if(current){setAllowed(false);setLoading(false)}return}
   const {data,error}=await supabase.rpc('has_beau_access');
   if(current){setAllowed(!error&&data===true);setLoading(false)}
  }
  setAllowed(false);setLoading(true);void refresh();
  const visible=()=>{if(document.visibilityState==='visible')void refresh()};
  window.addEventListener('focus',refresh);
  window.addEventListener('beau-access-changed',refresh);
  document.addEventListener('visibilitychange',visible);
  return()=>{
   current=false;
   window.removeEventListener('focus',refresh);
   window.removeEventListener('beau-access-changed',refresh);
   document.removeEventListener('visibilitychange',visible);
  };
 },[userId,active]);
 return {hasBeauAccess:allowed,beauAccessLoading:loading};
}
