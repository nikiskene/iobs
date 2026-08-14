// src/components/awards/InvestorDeckRequestModal.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

type Props = { open: boolean; onClose: () => void };
const COPY: Record<Locale,Record<string,string>> = {
  en:{received:'Request received',start:'The founding conversation starts here.',sent:'Your request is in the Institute inbox. We will send the partnership deck personally.',close:'Close',label:'Founding Partners',title:'Request the Partnership Deck.',intro:'Six ways to found, advance, amplify, sustain and celebrate Beautiful Success. Tell us who you are and we will send you the full partnership architecture.',name:'Name',email:'Email',org:'Organization',note:'Anything we should know?',sending:'Sending…',submit:'Request Partnership Deck',error:'Your request could not be sent. Please use the main contact form.'},
  de:{received:'Anfrage erhalten',start:'Hier beginnt das Gründungsgespräch.',sent:'Deine Anfrage ist im Institute-Inbox angekommen. Wir senden dir das Partnership Deck persönlich.',close:'Schließen',label:'Founding Partner',title:'Partnership Deck anfordern.',intro:'Sechs Wege, Beautiful Success zu gründen, voranzubringen, zu verstärken, zu tragen und zu feiern. Sag uns, wer du bist, und wir senden dir die vollständige Partnerschaftsarchitektur.',name:'Name',email:'E-Mail',org:'Organisation',note:'Was sollten wir wissen?',sending:'Wird gesendet…',submit:'Partnership Deck anfordern',error:'Die Anfrage konnte nicht gesendet werden. Bitte nutze das Kontaktformular.'},
  fr:{received:'Demande reçue',start:'La conversation fondatrice commence ici.',sent:'Votre demande est dans la boîte de réception de l’Institut. Nous vous enverrons personnellement le Partnership Deck.',close:'Fermer',label:'Partenaires fondateurs',title:'Demander le Partnership Deck.',intro:'Six façons de fonder, faire progresser, amplifier, soutenir et célébrer Beautiful Success. Dites-nous qui vous êtes et nous vous enverrons l’architecture complète du partenariat.',name:'Nom',email:'E-mail',org:'Organisation',note:'Quelque chose à nous signaler ?',sending:'Envoi…',submit:'Demander le Partnership Deck',error:'Votre demande n’a pas pu être envoyée. Utilisez le formulaire de contact principal.'},
  ar:{received:'تم استلام الطلب',start:'من هنا تبدأ المحادثة التأسيسية.',sent:'وصل طلبك إلى صندوق المعهد. سنرسل لك ملف الشراكة شخصياً.',close:'إغلاق',label:'الشركاء المؤسسون',title:'اطلب ملف الشراكة.',intro:'ست طرق لتأسيس Beautiful Success وتطويره وتوسيع أثره ودعمه والاحتفاء به. أخبرنا من أنت وسنرسل لك هيكل الشراكة كاملاً.',name:'الاسم',email:'البريد الإلكتروني',org:'المؤسسة',note:'هل هناك ما ينبغي أن نعرفه؟',sending:'جارٍ الإرسال…',submit:'اطلب ملف الشراكة',error:'تعذر إرسال طلبك. يرجى استخدام نموذج التواصل الرئيسي.'},
  zh:{received:'已收到申请',start:'创始合作的对话从这里开始。',sent:'你的申请已进入研究院收件箱。我们会亲自发送合作伙伴资料。',close:'关闭',label:'创始合作伙伴',title:'索取 Partnership Deck。',intro:'六种方式共同创立、推进、放大、支持并庆祝 Beautiful Success。告诉我们你是谁，我们会发送完整的合作架构。',name:'姓名',email:'邮箱',org:'机构',note:'还有什么需要我们了解？',sending:'发送中…',submit:'索取 Partnership Deck',error:'申请未能发送，请使用主联系表单。'},
  es:{received:'Solicitud recibida',start:'La conversación fundadora empieza aquí.',sent:'Tu solicitud está en la bandeja del Instituto. Te enviaremos personalmente el Partnership Deck.',close:'Cerrar',label:'Socios fundadores',title:'Solicita el Partnership Deck.',intro:'Seis formas de fundar, impulsar, amplificar, sostener y celebrar Beautiful Success. Cuéntanos quién eres y te enviaremos la arquitectura completa de la alianza.',name:'Nombre',email:'Correo electrónico',org:'Organización',note:'¿Hay algo que debamos saber?',sending:'Enviando…',submit:'Solicitar Partnership Deck',error:'No se pudo enviar la solicitud. Utiliza el formulario de contacto principal.'},
};

export default function InvestorDeckRequestModal({ open, onClose }: Props) {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
  }, [open, onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending'); setError('');
    const formElement = event.currentTarget; const form = new FormData(formElement);
    if (form.get('website')) { setState('sent'); return; }
    const note = String(form.get('message') || '').trim();
    const { error: insertError } = await supabase.from('contact_messages').insert({ name:String(form.get('name') || '').trim(), email:String(form.get('email') || '').trim(), organization:String(form.get('organization') || '').trim() || null, reason:'PARTNERSHIP DECK REQUEST · FOUNDING PARTNERS', message:`${note || 'Requested the Beautiful Success Award Founding Partnership Deck.'}\nLanguage: ${locale.toUpperCase()}` });
    if (insertError) { setError(copy.error); setState('error'); return; }
    formElement.reset(); setState('sent');
  }

  if (!open) return null;
  return <div className="deck-modal" role="dialog" aria-modal="true" aria-labelledby="deck-modal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="deck-modal-card"><button className="deck-modal-close" onClick={onClose} aria-label={copy.close}><X size={20} /></button>{state === 'sent' ? <div className="deck-modal-success"><p className="award-label">{copy.received}</p><h2 id="deck-modal-title">{copy.start}</h2><p>{copy.sent}</p><button className="award-button" onClick={onClose}>{copy.close}</button></div> : <><p className="award-label">{copy.label}</p><h2 id="deck-modal-title">{copy.title}</h2><p className="deck-modal-intro">{copy.intro}</p><form className="award-form deck-modal-form" onSubmit={submit}><label>{copy.name}<input name="name" required maxLength={120} autoFocus /></label><label>{copy.email}<input name="email" type="email" required maxLength={200} /></label><label>{copy.org}<input name="organization" maxLength={200} /></label><label>{copy.note}<textarea name="message" rows={4} maxLength={3000} /></label><input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />{state === 'error' && <p className="ibs-form-error">{error}</p>}<button className="ibs-submit" disabled={state === 'sending'}>{state === 'sending' ? copy.sending : copy.submit}</button></form></>}</div></div>;
}
