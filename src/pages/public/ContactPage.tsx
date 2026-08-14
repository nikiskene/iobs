// src/pages/public/ContactPage.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

const COPY: Record<Locale,{eyebrow:string;title:string;intro:string;label:string;sideTitle:string;sideCopy:string;thank:string;thankCopy:string;again:string;name:string;email:string;org:string;reason:string;select:string;message:string;sending:string;send:string;error:string;reasons:string[]}> = {
  en:{eyebrow:'The founding invitation',title:'Begin a beautiful conversation.',intro:'Tell us how you would like to help establish what the world celebrates as success.',label:'Contact the Institute',sideTitle:'It begins with one conversation.',sideCopy:'Founding host, partner, media, award and press inquiries arrive directly in the Institute’s private inbox.',thank:'Thank you.',thankCopy:'Your message has reached the Institute. We will be in touch personally.',again:'Send another message',name:'Name',email:'Email',org:'Organization',reason:'Reason',select:'Select one',message:'Message',sending:'Sending…',send:'Send message',error:'Your message could not be sent. Please try again.',reasons:['Founding Host','Founding Partner','Category Partner','Media Partner','Award nomination','Press','Other']},
  de:{eyebrow:'Die Gründungseinladung',title:'Beginne ein schönes Gespräch.',intro:'Sag uns, wie du mithelfen möchtest, neu zu definieren, was die Welt als Erfolg feiert.',label:'Das Institut kontaktieren',sideTitle:'Es beginnt mit einem Gespräch.',sideCopy:'Anfragen zu Founding Host, Partnerschaften, Medien, Award und Presse landen direkt im privaten Institute-Inbox.',thank:'Danke.',thankCopy:'Deine Nachricht ist beim Institut angekommen. Wir melden uns persönlich.',again:'Weitere Nachricht senden',name:'Name',email:'E-Mail',org:'Organisation',reason:'Anliegen',select:'Bitte wählen',message:'Nachricht',sending:'Wird gesendet…',send:'Nachricht senden',error:'Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.',reasons:['Founding Host','Founding Partner','Category Partner','Media Partner','Award-Nominierung','Presse','Sonstiges']},
  fr:{eyebrow:'L’invitation fondatrice',title:'Commencez une belle conversation.',intro:'Dites-nous comment vous souhaitez contribuer à redéfinir ce que le monde célèbre comme réussite.',label:'Contacter l’Institut',sideTitle:'Tout commence par une conversation.',sideCopy:'Les demandes liées à l’hôte fondateur, aux partenaires, aux médias, au prix et à la presse arrivent directement dans la boîte privée de l’Institut.',thank:'Merci.',thankCopy:'Votre message est arrivé à l’Institut. Nous vous répondrons personnellement.',again:'Envoyer un autre message',name:'Nom',email:'E-mail',org:'Organisation',reason:'Objet',select:'Choisir',message:'Message',sending:'Envoi…',send:'Envoyer',error:'Votre message n’a pas pu être envoyé. Veuillez réessayer.',reasons:['Hôte fondateur','Partenaire fondateur','Partenaire de catégorie','Partenaire média','Nomination au prix','Presse','Autre']},
  ar:{eyebrow:'الدعوة التأسيسية',title:'ابدأ محادثة جميلة.',intro:'أخبرنا كيف ترغب في المساعدة في تحديد ما يحتفي به العالم بوصفه نجاحاً.',label:'تواصل مع المعهد',sideTitle:'كل شيء يبدأ بمحادثة واحدة.',sideCopy:'تصل استفسارات المضيف المؤسس والشراكات والإعلام والجائزة والصحافة مباشرة إلى صندوق المعهد الخاص.',thank:'شكراً لك.',thankCopy:'وصلت رسالتك إلى المعهد. سنتواصل معك شخصياً.',again:'إرسال رسالة أخرى',name:'الاسم',email:'البريد الإلكتروني',org:'المؤسسة',reason:'السبب',select:'اختر',message:'الرسالة',sending:'جارٍ الإرسال…',send:'إرسال الرسالة',error:'تعذر إرسال رسالتك. حاول مرة أخرى.',reasons:['المضيف المؤسس','الشريك المؤسس','شريك الفئة','الشريك الإعلامي','ترشيح للجائزة','الصحافة','أخرى']},
  zh:{eyebrow:'创始邀请',title:'开启一场美好的对话。',intro:'告诉我们，你希望如何帮助重新定义世界应该庆祝怎样的成功。',label:'联系研究院',sideTitle:'一切始于一次对话。',sideCopy:'创始主办方、合作伙伴、媒体、奖项与新闻相关咨询都会直接进入研究院私人收件箱。',thank:'谢谢。',thankCopy:'你的消息已经到达研究院，我们会亲自与你联系。',again:'再发送一条消息',name:'姓名',email:'邮箱',org:'机构',reason:'联系原因',select:'请选择',message:'消息',sending:'发送中…',send:'发送消息',error:'消息未能发送，请重试。',reasons:['创始主办方','创始合作伙伴','类别合作伙伴','媒体合作伙伴','奖项提名','媒体/新闻','其他']},
  es:{eyebrow:'La invitación fundadora',title:'Empieza una conversación bella.',intro:'Cuéntanos cómo te gustaría ayudar a redefinir lo que el mundo celebra como éxito.',label:'Contactar con el Instituto',sideTitle:'Todo empieza con una conversación.',sideCopy:'Las consultas sobre anfitrión fundador, socios, medios, premio y prensa llegan directamente a la bandeja privada del Instituto.',thank:'Gracias.',thankCopy:'Tu mensaje ha llegado al Instituto. Nos pondremos en contacto personalmente.',again:'Enviar otro mensaje',name:'Nombre',email:'Correo electrónico',org:'Organización',reason:'Motivo',select:'Selecciona uno',message:'Mensaje',sending:'Enviando…',send:'Enviar mensaje',error:'No se pudo enviar el mensaje. Inténtalo de nuevo.',reasons:['Anfitrión fundador','Socio fundador','Socio de categoría','Socio de medios','Nominación al premio','Prensa','Otro']},
};

export default function ContactPage() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [params] = useSearchParams();
  const requestedReason = params.get('reason') || '';
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending'); setError('');
    const formElement = event.currentTarget; const form = new FormData(formElement);
    if (form.get('website')) { setState('sent'); return; }
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name:String(form.get('name') || '').trim(), email:String(form.get('email') || '').trim(), organization:String(form.get('organization') || '').trim() || null,
      reason:String(form.get('reason') || '').trim(), message:`${String(form.get('message') || '').trim()}\nLanguage: ${locale.toUpperCase()}`,
    });
    if (insertError) { setError(copy.error); setState('error'); return; }
    formElement.reset(); setState('sent');
  }

  return <main>
    <section className="ibs-page-hero"><p className="ibs-eyebrow">{copy.eyebrow}</p><div><h1>{copy.title}</h1><p>{copy.intro}</p></div></section>
    <section className="ibs-section nomination-layout">
      <div><p className="award-label">{copy.label}</p><h2>{copy.sideTitle}</h2><p>{copy.sideCopy}</p></div>
      {state === 'sent' ? <div className="award-form award-form-success"><h2>{copy.thank}</h2><p>{copy.thankCopy}</p><button className="award-text-link" onClick={() => setState('idle')}>{copy.again}</button></div> :
      <form className="award-form" onSubmit={submit}>
        <label>{copy.name}<input name="name" required maxLength={120} /></label><label>{copy.email}<input name="email" type="email" required maxLength={200} /></label><label>{copy.org}<input name="organization" maxLength={200} /></label>
        <label>{copy.reason}<select name="reason" required defaultValue={requestedReason}><option value="" disabled>{copy.select}</option>{requestedReason && !copy.reasons.includes(requestedReason) && <option value={requestedReason}>{requestedReason}</option>}{copy.reasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></label>
        <label>{copy.message}<textarea name="message" rows={7} required maxLength={5000} /></label><input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {state === 'error' && <p className="ibs-form-error">{error}</p>}<button className="ibs-submit" disabled={state === 'sending'}>{state === 'sending' ? copy.sending : copy.send}</button>
      </form>}
    </section>
  </main>;
}
