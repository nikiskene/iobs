// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

const COPY: Record<Locale,Record<string,string>> = {
  en:{eyebrow:'Private access',title:'Welcome back.',intro:'Enter the private administration and community behind the Beautiful Success Awards.',email:'Email',password:'Password',placeholder:'Your password',opening:'Opening the door…',enter:'Enter',note:'Not yet a member?',join:'Join the Institute'},
  de:{eyebrow:'Privater Zugang',title:'Willkommen zurück.',intro:'Betritt die private Administration und Community hinter den Beautiful Success Awards.',email:'E-Mail',password:'Passwort',placeholder:'Dein Passwort',opening:'Die Tür öffnet sich…',enter:'Eintreten',note:'Noch kein Mitglied?',join:'Dem Institut beitreten'},
  fr:{eyebrow:'Accès privé',title:'Bon retour.',intro:'Accédez à l’administration privée et à la communauté derrière les Beautiful Success Awards.',email:'E-mail',password:'Mot de passe',placeholder:'Votre mot de passe',opening:'Ouverture…',enter:'Entrer',note:'Pas encore membre ?',join:'Rejoindre l’Institut'},
  ar:{eyebrow:'دخول خاص',title:'مرحباً بعودتك.',intro:'ادخل إلى الإدارة الخاصة والمجتمع وراء جوائز Beautiful Success.',email:'البريد الإلكتروني',password:'كلمة المرور',placeholder:'كلمة المرور',opening:'جارٍ فتح الباب…',enter:'دخول',note:'لست عضواً بعد؟',join:'انضم إلى المعهد'},
  zh:{eyebrow:'私人访问',title:'欢迎回来。',intro:'进入 Beautiful Success Awards 背后的私人管理与社区空间。',email:'邮箱',password:'密码',placeholder:'你的密码',opening:'正在打开…',enter:'进入',note:'还不是成员？',join:'加入研究院'},
  es:{eyebrow:'Acceso privado',title:'Bienvenido de nuevo.',intro:'Entra en la administración privada y la comunidad detrás de los Beautiful Success Awards.',email:'Correo electrónico',password:'Contraseña',placeholder:'Tu contraseña',opening:'Abriendo la puerta…',enter:'Entrar',note:'¿Aún no eres miembro?',join:'Únete al Instituto'},
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle();
    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
  }

  return <main className="ibs-join"><div className="ibs-join-copy"><p className="ibs-eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div><div><form onSubmit={handleLogin} className="ibs-join-form"><div className="ibs-field"><label>{copy.email}</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></div><div className="ibs-field"><label>{copy.password}</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder={copy.placeholder} /></div>{error && <div className="ibs-form-error">{error}</div>}<button type="submit" disabled={loading} className="ibs-submit">{loading ? copy.opening : copy.enter}</button></form><p className="ibs-form-note">{copy.note} <Link to="/join">{copy.join}</Link></p></div></main>;
}
