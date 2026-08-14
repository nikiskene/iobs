// src/components/awards/AwardMethodSections.tsx
import { useLocale, type Locale } from '../../providers/LocaleProvider';

const COPY: Record<Locale, { label1:string; title1:string; lead1:string; formula:string; dimensions:[string,string][]; label2:string; title2:string; lead2:string; shifts:[string,string][] }> = {
  en:{label1:'What does beautiful success mean?',title1:'Success is shaped before it is measured.',lead1:'Beautiful Success begins with who we choose to become, what we choose to do and how we choose to pursue it.',formula:'Beautiful Success = Identity × Choices × Speed',dimensions:[['Identity','Who are we becoming?'],['Choices','What do we choose to do with what we have?'],['Speed','How fast do we pursue it - and at what cost?']],label2:'From need to offer',title2:'What happens beyond needs?',lead2:'Beautiful Success scales individual needs into collective growth - from what we require to what we can offer.',shifts:[['Self-actualization','Legacy'],['Esteem','Momentum'],['Belonging','Echo'],['Safety','New focus'],['Basic needs','Philanthropy']]},
  de:{label1:'Was bedeutet Beautiful Success?',title1:'Erfolg wird gestaltet, bevor er gemessen wird.',lead1:'Beautiful Success beginnt damit, wer wir werden wollen, was wir tun und wie wir es verfolgen.',formula:'Beautiful Success = Identität × Entscheidungen × Geschwindigkeit',dimensions:[['Identität','Wer werden wir?'],['Entscheidungen','Was tun wir mit dem, was wir haben?'],['Geschwindigkeit','Wie schnell verfolgen wir es – und zu welchem Preis?']],label2:'Vom Bedürfnis zum Angebot',title2:'Was geschieht jenseits von Bedürfnissen?',lead2:'Beautiful Success übersetzt individuelle Bedürfnisse in kollektives Wachstum – von dem, was wir brauchen, zu dem, was wir anbieten können.',shifts:[['Selbstverwirklichung','Vermächtnis'],['Wertschätzung','Momentum'],['Zugehörigkeit','Echo'],['Sicherheit','Neuer Fokus'],['Grundbedürfnisse','Philanthropie']]},
  fr:{label1:'Que signifie Beautiful Success ?',title1:'Le succès se façonne avant de se mesurer.',lead1:'Beautiful Success commence par qui nous choisissons de devenir, ce que nous choisissons de faire et la manière dont nous le poursuivons.',formula:'Beautiful Success = Identité × Choix × Vitesse',dimensions:[['Identité','Qui sommes-nous en train de devenir ?'],['Choix','Que choisissons-nous de faire avec ce que nous avons ?'],['Vitesse','À quelle vitesse le poursuivons-nous — et à quel coût ?']],label2:'Du besoin à l’offre',title2:'Que se passe-t-il au-delà des besoins ?',lead2:'Beautiful Success transforme les besoins individuels en croissance collective — de ce dont nous avons besoin à ce que nous pouvons offrir.',shifts:[['Accomplissement de soi','Héritage'],['Estime','Élan'],['Appartenance','Écho'],['Sécurité','Nouveau cap'],['Besoins fondamentaux','Philanthropie']]},
  ar:{label1:'ماذا يعني Beautiful Success؟',title1:'يتشكل النجاح قبل أن يُقاس.',lead1:'يبدأ Beautiful Success بمن نختار أن نصبح، وماذا نختار أن نفعل، وكيف نختار أن نسعى إليه.',formula:'Beautiful Success = الهوية × الخيارات × السرعة',dimensions:[['الهوية','من نصبح؟'],['الخيارات','ماذا نختار أن نفعل بما لدينا؟'],['السرعة','ما سرعة سعينا — وما كلفتها؟']],label2:'من الحاجة إلى العطاء',title2:'ماذا يحدث بعد تلبية الاحتياجات؟',lead2:'يوسّع Beautiful Success الاحتياجات الفردية إلى نمو جماعي — من ما نحتاجه إلى ما يمكننا تقديمه.',shifts:[['تحقيق الذات','الإرث'],['التقدير','الزخم'],['الانتماء','الصدى'],['الأمان','تركيز جديد'],['الاحتياجات الأساسية','العطاء']]},
  zh:{label1:'Beautiful Success 意味着什么？',title1:'成功在被衡量之前，先被塑造。',lead1:'Beautiful Success 始于我们选择成为什么样的人、选择做什么，以及选择以怎样的速度去实现。',formula:'Beautiful Success = 身份 × 选择 × 速度',dimensions:[['身份','我们正在成为什么？'],['选择','我们如何使用自己拥有的一切？'],['速度','我们追求得有多快——代价又是什么？']],label2:'从需要到给予',title2:'当需求被满足之后，会发生什么？',lead2:'Beautiful Success 把个人需求转化为集体成长——从我们需要什么，到我们能够给予什么。',shifts:[['自我实现','传承'],['尊重','动能'],['归属','回响'],['安全','新的焦点'],['基本需求','公益']]},
  es:{label1:'¿Qué significa Beautiful Success?',title1:'El éxito se moldea antes de medirse.',lead1:'Beautiful Success comienza con quién elegimos ser, qué elegimos hacer y cómo elegimos perseguirlo.',formula:'Beautiful Success = Identidad × Elecciones × Velocidad',dimensions:[['Identidad','¿En quién nos estamos convirtiendo?'],['Elecciones','¿Qué elegimos hacer con lo que tenemos?'],['Velocidad','¿Con qué rapidez lo perseguimos y a qué coste?']],label2:'De la necesidad a la oferta',title2:'¿Qué ocurre más allá de las necesidades?',lead2:'Beautiful Success transforma las necesidades individuales en crecimiento colectivo: de lo que necesitamos a lo que podemos ofrecer.',shifts:[['Autorrealización','Legado'],['Estima','Impulso'],['Pertenencia','Eco'],['Seguridad','Nuevo enfoque'],['Necesidades básicas','Filantropía']]},
};

export default function AwardMethodSections() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  return <>
    <section className="award-home-section award-method">
      <div className="award-section-title"><p className="award-label">{copy.label1}</p><h2>{copy.title1}</h2></div>
      <p className="award-lead">{copy.lead1}</p>
      <div className="award-dimensions">{copy.dimensions.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      <p className="award-formula">{copy.formula}</p>
    </section>
    <section className="award-home-section award-shift">
      <div className="award-section-title"><p className="award-label">{copy.label2}</p><h2>{copy.title2}</h2></div>
      <p className="award-lead">{copy.lead2}</p>
      <div className="award-shift-list">{copy.shifts.map(([need, offer]) => <p key={need}><span>{need}</span><b>→</b><strong>{offer}</strong></p>)}</div>
    </section>
  </>;
}
