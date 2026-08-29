// src/pages/auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

const COPY: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: 'Private access',
    requestTitle: 'Reset your password.',
    requestIntro: 'Enter your email and we\'ll send you a secure link to choose a new password.',
    email: 'Email',
    sending: 'Sending…',
    send: 'Send reset link',
    sent: 'Check your inbox — a reset link is on its way.',
    back: 'Back to sign in',
    newPasswordTitle: 'Choose a new password.',
    newPasswordIntro: 'Enter your new password below to finish resetting your account.',
    password: 'New password',
    placeholder: 'Your new password',
    saving: 'Saving…',
    save: 'Save new password',
    saved: 'Password updated — you can sign in now.',
    errorDefault: 'Something went wrong. Please try again.',
  },
  de: {
    eyebrow: 'Privater Zugang',
    requestTitle: 'Passwort zurücksetzen.',
    requestIntro: 'Gib deine E-Mail ein und wir senden dir einen sicheren Link für ein neues Passwort.',
    email: 'E-Mail',
    sending: 'Senden…',
    send: 'Link senden',
    sent: 'Schau in deinem Postfach nach — ein Link ist unterwegs.',
    back: 'Zurück zur Anmeldung',
    newPasswordTitle: 'Wähle ein neues Passwort.',
    newPasswordIntro: 'Gib unten dein neues Passwort ein, um das Zurücksetzen abzuschließen.',
    password: 'Neues Passwort',
    placeholder: 'Dein neues Passwort',
    saving: 'Speichern…',
    save: 'Neues Passwort speichern',
    saved: 'Passwort aktualisiert — du kannst dich jetzt anmelden.',
    errorDefault: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
  },
  fr: {
    eyebrow: 'Accès privé',
    requestTitle: 'Réinitialisez votre mot de passe.',
    requestIntro: 'Saisissez votre e-mail et nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.',
    email: 'E-mail',
    sending: 'Envoi…',
    send: 'Envoyer le lien',
    sent: 'Vérifiez votre boîte de réception — un lien est en route.',
    back: 'Retour à la connexion',
    newPasswordTitle: 'Choisissez un nouveau mot de passe.',
    newPasswordIntro: 'Saisissez votre nouveau mot de passe ci-dessous pour terminer la réinitialisation.',
    password: 'Nouveau mot de passe',
    placeholder: 'Votre nouveau mot de passe',
    saving: 'Enregistrement…',
    save: 'Enregistrer',
    saved: 'Mot de passe mis à jour — vous pouvez vous connecter.',
    errorDefault: 'Une erreur est survenue. Veuillez réessayer.',
  },
  ar: {
    eyebrow: 'دخول خاص',
    requestTitle: 'أعد تعيين كلمة المرور.',
    requestIntro: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لاختيار كلمة مرور جديدة.',
    email: 'البريد الإلكتروني',
    sending: 'جارٍ الإرسال…',
    send: 'إرسال الرابط',
    sent: 'تحقق من بريدك — الرابط في طريقه إليك.',
    back: 'العودة لتسجيل الدخول',
    newPasswordTitle: 'اختر كلمة مرور جديدة.',
    newPasswordIntro: 'أدخل كلمة المرور الجديدة أدناه لإكمال إعادة التعيين.',
    password: 'كلمة المرور الجديدة',
    placeholder: 'كلمة المرور الجديدة',
    saving: 'جارٍ الحفظ…',
    save: 'حفظ كلمة المرور',
    saved: 'تم تحديث كلمة المرور — يمكنك تسجيل الدخول الآن.',
    errorDefault: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  },
  zh: {
    eyebrow: '私人访问',
    requestTitle: '重置你的密码。',
    requestIntro: '输入你的邮箱，我们会发送一个安全链接让你设置新密码。',
    email: '邮箱',
    sending: '发送中…',
    send: '发送重置链接',
    sent: '请查看你的收件箱 — 重置链接已发出。',
    back: '返回登录',
    newPasswordTitle: '设置新密码。',
    newPasswordIntro: '在下方输入你的新密码以完成重置。',
    password: '新密码',
    placeholder: '你的新密码',
    saving: '保存中…',
    save: '保存新密码',
    saved: '密码已更新 — 你现在可以登录了。',
    errorDefault: '出了点问题，请重试。',
  },
  es: {
    eyebrow: 'Acceso privado',
    requestTitle: 'Restablece tu contraseña.',
    requestIntro: 'Introduce tu correo y te enviaremos un enlace seguro para elegir una nueva contraseña.',
    email: 'Correo electrónico',
    sending: 'Enviando…',
    send: 'Enviar enlace',
    sent: 'Revisa tu bandeja de entrada — el enlace está en camino.',
    back: 'Volver a iniciar sesión',
    newPasswordTitle: 'Elige una nueva contraseña.',
    newPasswordIntro: 'Introduce tu nueva contraseña a continuación para completar el restablecimiento.',
    password: 'Nueva contraseña',
    placeholder: 'Tu nueva contraseña',
    saving: 'Guardando…',
    save: 'Guardar nueva contraseña',
    saved: 'Contraseña actualizada — ya puedes iniciar sesión.',
    errorDefault: 'Algo salió mal. Inténtalo de nuevo.',
  },
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const copy = COPY[locale];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const isRecovery = window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token');

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }
    setInfo(copy.sent);
    setLoading(false);
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setInfo(copy.saved);
    setLoading(false);
    setTimeout(() => navigate('/login'), 2000);
  }

  const title = isRecovery ? copy.newPasswordTitle : copy.requestTitle;
  const intro = isRecovery ? copy.newPasswordIntro : copy.requestIntro;

  return (
    <main className="ibs-join">
      <div className="ibs-join-copy">
        <p className="ibs-eyebrow">{copy.eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <div>
        {isRecovery ? (
          <form onSubmit={handleUpdate} className="ibs-join-form">
            <div className="ibs-field">
              <label>{copy.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder={copy.placeholder}
              />
            </div>
            {error && <div className="ibs-form-error">{error}</div>}
            {info && <div className="ibs-form-note">{info}</div>}
            <button type="submit" disabled={loading} className="ibs-submit">
              {loading ? copy.saving : copy.save}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest} className="ibs-join-form">
            <div className="ibs-field">
              <label>{copy.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            {error && <div className="ibs-form-error">{error}</div>}
            {info && <div className="ibs-form-note">{info}</div>}
            <button type="submit" disabled={loading} className="ibs-submit">
              {loading ? copy.sending : copy.send}
            </button>
          </form>
        )}
        <p className="ibs-form-note">
          <Link to="/login">{copy.back}</Link>
        </p>
      </div>
    </main>
  );
}
