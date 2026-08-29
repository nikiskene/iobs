// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLocale, type Locale } from "../../providers/LocaleProvider";

const COPY: Record<Locale, Record<string, string>> = {
  en: { eyebrow: "Private access", title: "Welcome back.", intro: "Enter the private administration and community behind the Beautiful Success Awards.", email: "Email", password: "Password", placeholder: "Your password", opening: "Opening the door\u2026", enter: "Enter", note: "Not yet a member?", join: "Join the Institute", forgot: "Forgot password?" },
  de: { eyebrow: "Privater Zugang", title: "Willkommen zur\u00fcck.", intro: "Betritt die private Administration und Community hinter den Beautiful Success Awards.", email: "E-Mail", password: "Passwort", placeholder: "Dein Passwort", opening: "Die T\u00fcr \u00f6ffnet sich\u2026", enter: "Eintreten", note: "Noch kein Mitglied?", join: "Dem Institut beitreten", forgot: "Passwort vergessen?" },
  fr: { eyebrow: "Acc\u00e8s priv\u00e9", title: "Bon retour.", intro: "Acc\u00e9dez \u00e0 l\u2019administration priv\u00e9e et \u00e0 la communaut\u00e9 derri\u00e8re les Beautiful Success Awards.", email: "E-mail", password: "Mot de passe", placeholder: "Votre mot de passe", opening: "Ouverture\u2026", enter: "Entrer", note: "Pas encore membre ?", join: "Rejoindre l\u2019Institut", forgot: "Mot de passe oubli\u00e9 ?" },
  ar: { eyebrow: "\u062f\u062e\u0648\u0644 \u062e\u0627\u0635", title: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643.", intro: "\u0627\u062f\u062e\u0644 \u0625\u0644\u0649 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062e\u0627\u0635\u0629 \u0648\u0627\u0644\u0645\u062c\u062a\u0645\u0639 \u0648\u0631\u0627\u0621 \u062c\u0648\u0627\u0626\u0632 Beautiful Success.", email: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", placeholder: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", opening: "\u062c\u0627\u0631\u064d \u0641\u062a\u062d \u0627\u0644\u0628\u0627\u0628\u2026", enter: "\u062f\u062e\u0648\u0644", note: "\u0644\u0633\u062a \u0639\u0636\u0648\u0627\u064b \u0628\u0639\u062f\u061f", join: "\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0639\u0647\u062f", forgot: "\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f" },
  zh: { eyebrow: "\u79c1\u4eba\u8bbf\u95ee", title: "\u6b22\u8fce\u56de\u6765\u3002", intro: "\u8fdb\u5165 Beautiful Success Awards \u80cc\u540e\u7684\u79c1\u4eba\u7ba1\u7406\u4e0e\u793e\u533a\u7a7a\u95f4\u3002", email: "\u90ae\u7bb1", password: "\u5bc6\u7801", placeholder: "\u4f60\u7684\u5bc6\u7801", opening: "\u6b63\u5728\u6253\u5f00\u2026", enter: "\u8fdb\u5165", note: "\u8fd8\u4e0d\u662f\u6210\u5458\uff1f", join: "\u52a0\u5165\u7814\u7a76\u9662", forgot: "\u5fd8\u8bb0\u5bc6\u7801\uff1f" },
  es: { eyebrow: "Acceso privado", title: "Bienvenido de nuevo.", intro: "Entra en la administraci\u00f3n privada y la comunidad detr\u00e1s de los Beautiful Success Awards.", email: "Correo electr\u00f3nico", password: "Contrase\u00f1a", placeholder: "Tu contrase\u00f1a", opening: "Abriendo la puerta\u2026", enter: "Entrar", note: "\u00bfA\u00fan no eres miembro?", join: "\u00danete al Instituto", forgot: "\u00bfOlvidaste tu contrase\u00f1a?" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    navigate(profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="ibs-join">
      <div className="ibs-join-copy">
        <p className="ibs-eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </div>
      <div>
        <form onSubmit={handleLogin} className="ibs-join-form">
          <div className="ibs-field">
            <label>{copy.email}</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="ibs-field">
            <label>{copy.password}</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder={copy.placeholder} />
          </div>
          {error && <div className="ibs-form-error">{error}</div>}
          <button type="submit" disabled={loading} className="ibs-submit">{loading ? copy.opening : copy.enter}</button>
        </form>
        <p className="ibs-form-note"><Link to="/reset-password">{copy.forgot}</Link></p>
        <p className="ibs-form-note">{copy.note} <Link to="/join">{copy.join}</Link></p>
      </div>
    </main>
  );
}
