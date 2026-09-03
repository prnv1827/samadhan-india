import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, User } from '../types';

interface AuthValue { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<User>; signUp: (data: {name:string;email:string;password:string;role:Role;organization?:string;state?:string}) => Promise<User>; signOut: () => Promise<void>; }
const ADMIN_EMAIL='admin@samadhan.local'; const ADMIN_PASSWORD='admin123'; const STORAGE_VERSION='3';
const AuthContext=createContext<AuthValue|null>(null);

async function api<T>(url:string, options:RequestInit={}):Promise<T>{const r=await fetch(url,options);const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Request failed');return data;}
function saveSession(user:User,token:string){localStorage.setItem('samadhan-auth-version',STORAGE_VERSION);localStorage.setItem('samadhan-user',JSON.stringify(user));localStorage.setItem('samadhan-token',token);}
export function isAdminCredentials(email:string,password:string){return email.trim().toLowerCase()===ADMIN_EMAIL&&password===ADMIN_PASSWORD;}
export {ADMIN_EMAIL,ADMIN_PASSWORD};

export function AuthProvider({children,initialRole}:{children:React.ReactNode;initialRole?:Role|null}){
 const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{const version=localStorage.getItem('samadhan-auth-version');const token=localStorage.getItem('samadhan-token');if(version!==STORAGE_VERSION||!token){localStorage.removeItem('samadhan-user');localStorage.removeItem('samadhan-token');setLoading(false);return;} api<{user:User}>('/api/auth/me',{headers:{Authorization:`Bearer ${token}`}}).then(d=>setUser(d.user)).catch(()=>{localStorage.removeItem('samadhan-user');localStorage.removeItem('samadhan-token');}).finally(()=>setLoading(false));},[]);
 const signIn=useCallback(async(email:string,password:string)=>{const d=await api<{user:User;token:string}>('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});saveSession(d.user,d.token);setUser(d.user);return d.user;},[]);
 const signUp=useCallback(async(data:{name:string;email:string;password:string;role:Role;organization?:string;state?:string})=>{const d=await api<{user:User;token:string}>('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});saveSession(d.user,d.token);setUser(d.user);return d.user;},[]);
 const signOut=useCallback(async()=>{const token=localStorage.getItem('samadhan-token');try{if(token)await fetch('/api/auth/logout',{method:'POST',headers:{Authorization:`Bearer ${token}`}});}finally{localStorage.removeItem('samadhan-user');localStorage.removeItem('samadhan-token');setUser(null);}},[]);
 const value=useMemo(()=>({user,loading,signIn,signUp,signOut}),[user,loading,signIn,signUp,signOut]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used inside AuthProvider');return c;}
