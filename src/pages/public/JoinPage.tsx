import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

const COPY: Record<Locale,Record<string,string>> = {
  en:{eyebrow:'Membership · Public beta',title:'Join the Institute.',intro:'Enter the community behind the Institute of Beautiful Success—a place for people building more beautiful definitions of success.',name:'Full name',namePh:'Your full name',email:'Email',password:'Password',passwordPh:'At least 6 characters',loading:'Preparing your membership…',submit:'Enter the public beta',note:'Already have an account?',signin:'Sign in'},
  de:{eyebrow:'Mitgliedschaft · Public Beta',title:'Werde Teil des Instituts.',intro:'Komm in die Community hinter dem Institute of Beautiful Success – für Menschen, die schönere Definitionen von Erfolg gestalten.',name:'Vollständiger Name',namePh:'Dein vollständiger Name',email:'E-Mail',password:'Passwort',passwordPh:'Mindestens 6 Zeichen',loading:'Mitgliedschaft wird vorbereitet…',submit:'Public Beta betreten',note:'Schon ein Konto?',signin:'Anmelden'},
  fr:{eyebrow:'Adhésion · Bêta publique',title:'Rejoignez l’Institut.',intro:'Entrez dans la communauté de l’Institute of Beautiful Success — un lieu pour celles et ceux qui construisent de plus belles définitions du succès.',name:'Nom complet',namePh:'Votre nom complet',email:'E-mail',password:'Mot de passe',passwordPh:'Au moins 6 caractères',loading:'Préparation de votre adhésion…',submit:'Entrer dans la bêta publique',note:'Vous avez déjà un compte ?',signin:'Se connecter'},
  ar:{eyebrow:'العضوية · النسخة التجريبية العامة',title:'انضم إلى المعهد.',intro:'انضم إلى المجتمع وراء Institute of Beautiful Success — مساحة لمن يبنون تعريفات أجمل للنجاح.',name:'الاسم الكامل',namePh:'اسمك الكامل',email:'البريد الإلكتروني',password:'كلمة المرور',passwordPh:'6 أحرف على الأقل',loading:'جارٍ إعداد عضويتك…',submit:'دخول النسخة التجريبية',note:'لديك حساب بالفعل؟',signin:'تسجيل الدخول'},
  zh:{eyebrow:'会员 · 公测版',title:'加入研究院。',intro:'加入 Institute of Beautiful Success 背后的社区——这里汇聚正在创造更美好成功定义的人。',name:'全名',namePh:'你的全名',email:'邮箱',password:'密码',passwordPh:'至少 6 个字符',loading:'正在准备会员资格…',submit:'进入公测版',note:'已经有账号？',signin:'登录'},
  es:{eyebrow:'Membresía · Beta pública',title:'Únete al Instituto.',intro:'Entra en la comunidad detrás del Institute of Beautiful Success: un lugar para personas que construyen definiciones más bellas del éxito.',name:'Nombre completo',namePh:'Tu nombre completo',email:'Correo electrónico',password:'Contraseña',passwordPh:'Al menos 6 caracteres',loading:'Preparando tu membresía…',submit:'Entrar en la beta pública',note:'¿Ya tienes una cuenta?',signin:'Iniciar sesión'},
};

export default function JoinPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [fullName,setFullName] = useState(''); const [error,setError] = useState(''); const [loading,setLoading] = useState(false);

  const handleSignup = async (e:React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { error:authError } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name:fullName } } });
    if (authError) { setError(authError.message); setLoading(false); return; }
    navigate('/dashboard');
  };

  return <main className="ibs-join"><div className="ibs-join-copy"><p className="ibs-eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div><div><form onSubmit={handleSignup} className="ibs-join-form"><div className="ibs-field"><label>{copy.name}</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder={copy.namePh} /></div><div className="ibs-field"><label>{copy.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></div><div className="ibs-field"><label>{copy.password}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder={copy.passwordPh} /></div>{error && <div className="ibs-form-error">{error}</div>}<button type="submit" disabled={loading} className="ibs-submit">{loading ? copy.loading : copy.submit}</button></form><p className="ibs-form-note">{copy.note} <Link to="/login">{copy.signin}</Link></p></div></main>;
}
