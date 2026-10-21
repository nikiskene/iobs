import {useBeauAccess} from '../hooks/useBeauAccess';
import { lazy, type ReactNode } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Navigation from '../components/Navigation';
const BeauPage=lazy(()=>import('../pages/beau/BeauPage'));
const BeauAdmin=lazy(()=>import('../pages/beau/BeauAdmin'));
function BeauGate({children}:{children:ReactNode}){const {hasBeauAccess,beauAccessLoading}=useBeauAccess();if(beauAccessLoading)return <main className="pt-28 px-4"><p role="status">Checking BEAU access…</p></main>;return hasBeauAccess?<>{children}</>:<main className="pt-28 px-4 max-w-3xl mx-auto"><h1 className="text-2xl">BEAU access</h1><p className="mt-4">An Admin needs to approve your BEAU access before you can use it. Please contact an Admin.</p></main>}
export default function BeauRoutes(){return <><Route path="/beau" element={<ProtectedRoute><Navigation/><BeauGate><BeauPage/></BeauGate></ProtectedRoute>}/><Route path="/beau/knowledge" element={<ProtectedRoute><Navigation/><BeauGate><main className="pt-28 px-4 pb-8 max-w-6xl mx-auto"><BeauAdmin/></main></BeauGate></ProtectedRoute>}/></>}
