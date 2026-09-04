// src/providers/LocaleProvider.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const LOCALES = ['en', 'de', 'fr', 'ar', 'zh', 'es'] as const;
export type Locale = typeof LOCALES[number];

export const LANGUAGE_OPTIONS: { code: Locale; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];

const ACTIVE_LOCALES: Locale[] = ['en', 'ar'];

type Dictionary = Record<string, string>;

const EN: Dictionary = {
  'nav.award':'The Award','nav.categories':'Categories','nav.judging':'How We Judge','nav.voices':'Founding Voices','nav.partners':'Partners','nav.nominate':'Nominate',
  'dial.hint':'Click the dial. Change the perspective.','category.suffix':'award category',
  'story.standard':'The standard','story.submission':'Submission','story.question':'The question','story.nominate':'Nominate a success','story.enter':'Enter this category',
  'story.question.copy':'If this becomes dramatically more successful, does its positive value grow with it?','story.fee':'Founding Edition entry fee: {fee}. Fee waivers will protect access where needed.',
  'cases.title':'What Beautiful Success Looks Like','cases.loading':'Selecting cases…','cases.empty':'The first defining cases for this category are being selected.','cases.all':'Explore all cases →',
  'home.judgingLink':'Explore the judging standard →','home.voicesButton':'Discover Founding Voices','home.nominate':'Nominate a beautiful success','home.partner':'Become a Founding Partner →',
  'partners.aria':'Partners',
  'footer.award':'The Award','footer.institute':'The Institute','footer.institutional':'Institutional','footer.categories':'Categories','footer.judging':'Judging','footer.nominate':'Nominate','footer.enter':'Enter','footer.voices':'Founding Voices','footer.assembly':'Assembly','footer.experiences':'Experiences','footer.contact':'Contact','footer.foundingPartners':'Founding Partners','footer.governance':'Governance','footer.partnerBriefing':'Partner Briefing','footer.login':'Login','footer.claim':'Celebrating a better world, one Beautiful Success at a time.','footer.edition':'Founding Edition',
};

const DE: Dictionary = {
  'nav.award':'Der Award','nav.categories':'Kategorien','nav.judging':'Wie wir bewerten','nav.voices':'Gründungsstimmen','nav.partners':'Partner','nav.nominate':'Nominieren',
  'dial.hint':'Klicke auf den Regler. Wechsle die Perspektive.','category.suffix':'Award-Kategorie',
  'story.standard':'Der Maßstab','story.submission':'Einreichung','story.question':'Die Frage','story.nominate':'Erfolg nominieren','story.enter':'In dieser Kategorie einreichen',
  'story.question.copy':'Wenn dies dramatisch erfolgreicher wird, wächst dann auch sein positiver Wert?','story.fee':'Teilnahmegebühr der Founding Edition: {fee}. Bei Bedarf sichern Gebührenbefreiungen den Zugang.',
  'cases.title':'So sieht Beautiful Success aus','cases.loading':'Fälle werden ausgewählt…','cases.empty':'Die ersten prägenden Fälle für diese Kategorie werden derzeit ausgewählt.','cases.all':'Alle Fälle entdecken →',
  'home.judgingLink':'Bewertungsmaßstab entdecken →','home.voicesButton':'Gründungsstimmen entdecken','home.nominate':'Beautiful Success nominieren','home.partner':'Founding Partner werden →',
  'partners.aria':'Partner',
  'footer.award':'Der Award','footer.institute':'Das Institut','footer.institutional':'Institutionell','footer.categories':'Kategorien','footer.judging':'Bewertung','footer.nominate':'Nominieren','footer.enter':'Einreichen','footer.voices':'Gründungsstimmen','footer.assembly':'Assembly','footer.experiences':'Experiences','footer.contact':'Kontakt','footer.foundingPartners':'Founding Partner','footer.governance':'Governance','footer.partnerBriefing':'Partner Briefing','footer.login':'Login','footer.claim':'Eine bessere Welt feiern – ein Beautiful Success nach dem anderen.','footer.edition':'Founding Edition',
};

const FR: Dictionary = {
  'nav.award':'Le Prix','nav.categories':'Catégories','nav.judging':'Notre évaluation','nav.voices':'Voix fondatrices','nav.partners':'Partenaires','nav.nominate':'Nominer',
  'dial.hint':'Cliquez sur le cadran. Changez de perspective.','category.suffix':'catégorie du prix',
  'story.standard':'Le standard','story.submission':'Candidature','story.question':'La question','story.nominate':'Nominer une réussite','story.enter':'Candidater dans cette catégorie',
  'story.question.copy':'Si cette réussite prend une ampleur spectaculaire, sa valeur positive grandit-elle avec elle ?','story.fee':'Frais de candidature de l’édition fondatrice : {fee}. Des exonérations préserveront l’accès si nécessaire.',
  'cases.title':'À quoi ressemble Beautiful Success','cases.loading':'Sélection des cas…','cases.empty':'Les premiers cas emblématiques de cette catégorie sont en cours de sélection.','cases.all':'Découvrir tous les cas →',
  'home.judgingLink':'Découvrir le standard d’évaluation →','home.voicesButton':'Découvrir les voix fondatrices','home.nominate':'Nominer un Beautiful Success','home.partner':'Devenir partenaire fondateur →',
  'partners.aria':'Partenaires',
  'footer.award':'Le Prix','footer.institute':'L’Institut','footer.institutional':'Institutionnel','footer.categories':'Catégories','footer.judging':'Évaluation','footer.nominate':'Nominer','footer.enter':'Candidater','footer.voices':'Voix fondatrices','footer.assembly':'Assemblée','footer.experiences':'Expériences','footer.contact':'Contact','footer.foundingPartners':'Partenaires fondateurs','footer.governance':'Gouvernance','footer.partnerBriefing':'Dossier partenaires','footer.login':'Connexion','footer.claim':'Célébrer un monde meilleur, un Beautiful Success à la fois.','footer.edition':'Édition fondatrice',
};

const AR: Dictionary = {
  'nav.award':'الجائزة','nav.categories':'الفئات','nav.judging':'كيف نقيّم','nav.voices':'الأصوات المؤسسة','nav.partners':'الشركاء','nav.nominate':'رشّح',
  'dial.hint':'انقر على القرص. غيّر المنظور.','category.suffix':'فئة الجائزة',
  'story.standard':'المعيار','story.submission':'التقديم','story.question':'السؤال','story.nominate':'رشّح نجاحاً','story.enter':'تقدّم لهذه الفئة',
  'story.question.copy':'إذا أصبح هذا أكثر نجاحاً بصورة كبيرة، فهل تنمو قيمته الإيجابية معه؟','story.fee':'رسوم التقديم للنسخة التأسيسية: {fee}. تتوفر إعفاءات عند الحاجة لضمان الوصول.',
  'cases.title':'كيف يبدو النجاح الجميل','cases.loading':'جارٍ اختيار الحالات…','cases.empty':'يجري اختيار أولى الحالات المعرِّفة لهذه الفئة.','cases.all':'استكشف جميع الحالات ←',
  'home.judgingLink':'استكشف معيار التحكيم ←','home.voicesButton':'اكتشف الأصوات المؤسسة','home.nominate':'رشّح نجاحاً جميلاً','home.partner':'كن شريكاً مؤسساً ←',
  'partners.aria':'الشركاء',
  'footer.award':'الجائزة','footer.institute':'المعهد','footer.institutional':'المؤسسة','footer.categories':'الفئات','footer.judging':'التحكيم','footer.nominate':'رشّح','footer.enter':'تقدّم','footer.voices':'الأصوات المؤسسة','footer.assembly':'الجمعية','footer.experiences':'التجارب','footer.contact':'تواصل','footer.foundingPartners':'الشركاء المؤسسون','footer.governance':'الحوكمة','footer.partnerBriefing':'ملف الشركاء','footer.login':'تسجيل الدخول','footer.claim':'نحتفي بعالم أفضل، نجاح جميل واحداً تلو الآخر.','footer.edition':'النسخة التأسيسية',
};

const ZH: Dictionary = {
  'nav.award':'奖项','nav.categories':'类别','nav.judging':'评审方式','nav.voices':'创始之声','nav.partners':'合作伙伴','nav.nominate':'提名',
  'dial.hint':'点击旋钮，切换视角。','category.suffix':'奖项类别',
  'story.standard':'评判标准','story.submission':'申报','story.question':'核心问题','story.nominate':'提名一个成功案例','story.enter':'申报此类别',
  'story.question.copy':'如果它取得巨大成功，它所创造的正向价值是否也会随之增长？','story.fee':'创始届申报费：{fee}。必要时可申请费用减免，以保障参与机会。',
  'cases.title':'Beautiful Success 的真实模样','cases.loading':'正在选择案例…','cases.empty':'本类别的首批代表性案例正在遴选中。','cases.all':'查看全部案例 →',
  'home.judgingLink':'查看评审标准 →','home.voicesButton':'发现创始之声','home.nominate':'提名 Beautiful Success','home.partner':'成为创始合作伙伴 →',
  'partners.aria':'合作伙伴',
  'footer.award':'奖项','footer.institute':'研究院','footer.institutional':'机构','footer.categories':'类别','footer.judging':'评审','footer.nominate':'提名','footer.enter':'申报','footer.voices':'创始之声','footer.assembly':'大会','footer.experiences':'体验','footer.contact':'联系','footer.foundingPartners':'创始合作伙伴','footer.governance':'治理','footer.partnerBriefing':'合作伙伴资料','footer.login':'登录','footer.claim':'一次庆祝一个 Beautiful Success，让世界变得更好。','footer.edition':'创始届',
};

const ES: Dictionary = {
  'nav.award':'El Premio','nav.categories':'Categorías','nav.judging':'Cómo evaluamos','nav.voices':'Voces fundadoras','nav.partners':'Socios','nav.nominate':'Nominar',
  'dial.hint':'Haz clic en el dial. Cambia la perspectiva.','category.suffix':'categoría del premio',
  'story.standard':'El estándar','story.submission':'Candidatura','story.question':'La pregunta','story.nominate':'Nominar un éxito','story.enter':'Participar en esta categoría',
  'story.question.copy':'Si esto se vuelve mucho más exitoso, ¿crece también su valor positivo?','story.fee':'Cuota de candidatura de la Edición Fundadora: {fee}. Habrá exenciones cuando sean necesarias para proteger el acceso.',
  'cases.title':'Cómo se ve Beautiful Success','cases.loading':'Seleccionando casos…','cases.empty':'Se están seleccionando los primeros casos que definirán esta categoría.','cases.all':'Explorar todos los casos →',
  'home.judgingLink':'Explorar el estándar de evaluación →','home.voicesButton':'Descubrir las voces fundadoras','home.nominate':'Nominar un Beautiful Success','home.partner':'Convertirse en socio fundador →',
  'partners.aria':'Socios',
  'footer.award':'El Premio','footer.institute':'El Instituto','footer.institutional':'Institucional','footer.categories':'Categorías','footer.judging':'Evaluación','footer.nominate':'Nominar','footer.enter':'Participar','footer.voices':'Voces fundadoras','footer.assembly':'Asamblea','footer.experiences':'Experiencias','footer.contact':'Contacto','footer.foundingPartners':'Socios fundadores','footer.governance':'Gobernanza','footer.partnerBriefing':'Dossier para socios','footer.login':'Acceso','footer.claim':'Celebrando un mundo mejor, un Beautiful Success a la vez.','footer.edition':'Edición Fundadora',
};

const DICTIONARIES: Record<Locale, Dictionary> = { en: EN, de: DE, fr: FR, ar: AR, zh: ZH, es: ES };

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string, vars?: Record<string,string>) => string; isRtl: boolean };
const LocaleContext = createContext<LocaleContextValue>({ locale:'en', setLocale:()=>{}, t:(key)=>EN[key] || key, isRtl:false });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('beautiful-success-locale') : null;
    if (stored && ACTIVE_LOCALES.includes(stored as Locale)) return stored as Locale;
    const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0,2).toLowerCase() : 'en';
    return ACTIVE_LOCALES.includes(browser as Locale) ? browser as Locale : 'en';
  });
  const setLocale = (next: Locale) => { setLocaleState(next); window.localStorage.setItem('beautiful-success-locale', next); };
  const isRtl = locale === 'ar';
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    const id = 'iobs-locale-fonts';
    document.getElementById(id)?.remove();
    if (locale === 'ar' || locale === 'zh') {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = locale === 'ar'
        ? 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600&display=swap'
        : 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;600&display=swap';
      document.head.appendChild(link);
    }
    return () => {
      document.getElementById(id)?.remove();
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, [locale, isRtl]);
  const value = useMemo(() => ({ locale, setLocale, isRtl, t:(key:string, vars:Record<string,string>={}) => {
    let value = DICTIONARIES[locale][key] || EN[key] || key;
    Object.entries(vars).forEach(([name,replacement]) => { value = value.replace(`{${name}}`, replacement); });
    return value;
  }}), [locale, isRtl]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
