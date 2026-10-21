import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Navigation from '../components/Navigation';
const BeauPage=lazy(()=>import('../pages/beau/BeauPage'));
const BeauAdmin=lazy(()=>import('../pages/beau/BeauAdmin'));
export default function BeauRoutes(){return <><Route path="/beau" element={<ProtectedRoute><Navigation/><BeauPage/></ProtectedRoute>}/><Route path="/beau/knowledge" element={<ProtectedRoute><Navigation/><main className="pt-28 px-4 pb-8 max-w-6xl mx-auto"><BeauAdmin/></main></ProtectedRoute>}/></>}
