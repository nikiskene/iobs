// src/content/awardSiteTranslations.ts
import type { Locale } from '../providers/LocaleProvider';
import type { AwardSiteContent } from '../providers/AwardSiteContentProvider';

type Copy = Partial<Pick<AwardSiteContent,'label'|'headline'|'subheadline'|'body'>>;

const BASE: Record<string, Omit<AwardSiteContent,'label'|'headline'|'subheadline'|'body'|'locale'>> = {
  hero_me:{content_key:'hero_me',section:'hero',media_url:null,media_path:null,display_order:10,is_active:true},
  hero_community:{content_key:'hero_community',section:'hero',media_url:null,media_path:null,display_order:20,is_active:true},
  hero_team:{content_key:'hero_team',section:'hero',media_url:null,media_path:null,display_order:30,is_active:true},
  hero_company:{content_key:'hero_company',section:'hero',media_url:null,media_path:null,display_order:40,is_active:true},
  hero_country:{content_key:'hero_country',section:'hero',media_url:null,media_path:null,display_order:50,is_active:true},
  hero_world:{content_key:'hero_world',section:'hero',media_url:null,media_path:null,display_order:60,is_active:true},
  hero_universe:{content_key:'hero_universe',section:'hero',media_url:null,media_path:null,display_order:70,is_active:true},
  site_claim:{content_key:'site_claim',section:'global',media_url:null,media_path:null,display_order:80,is_active:true},
  principle:{content_key:'principle',section:'homepage',media_url:null,media_path:null,display_order:100,is_active:true},
  judging_intro:{content_key:'judging_intro',section:'homepage',media_url:null,media_path:null,display_order:110,is_active:true},
  recognition_intro:{content_key:'recognition_intro',section:'homepage',media_url:null,media_path:null,display_order:120,is_active:true},
  voices_intro:{content_key:'voices_intro',section:'homepage',media_url:null,media_path:null,display_order:130,is_active:true},
  founding_edition:{content_key:'founding_edition',section:'homepage',media_url:null,media_path:null,display_order:140,is_active:true},
  partners_intro:{content_key:'partners_intro',section:'partners',media_url:null,media_path:null,display_order:150,is_active:true},
  v3_hero:{content_key:'v3_hero',section:'homepage_v3',media_url:null,media_path:null,display_order:200,is_active:true},
  v3_hero_images:{content_key:'v3_hero_images',section:'homepage_v3',media_url:null,media_path:null,display_order:210,is_active:true},
  v3_principle:{content_key:'v3_principle',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/principle.png',media_path:'V3/principle.png',display_order:220,is_active:true},
  v3_principles_intro:{content_key:'v3_principles_intro',section:'homepage_v3',media_url:null,media_path:null,display_order:225,is_active:true},
  v3_principle_philanthropy:{content_key:'v3_principle_philanthropy',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/philantropy.png',media_path:'V3/philantropy.png',display_order:230,is_active:true},
  v3_principle_new_focus:{content_key:'v3_principle_new_focus',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/new%20focus.png',media_path:'V3/new focus.png',display_order:240,is_active:true},
  v3_principle_echo:{content_key:'v3_principle_echo',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/echo.png',media_path:'V3/echo.png',display_order:250,is_active:true},
  v3_principle_momentum:{content_key:'v3_principle_momentum',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/momentum.png',media_path:'V3/momentum.png',display_order:260,is_active:true},
  v3_principle_legacy:{content_key:'v3_principle_legacy',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/legacy.png',media_path:'V3/legacy.png',display_order:270,is_active:true},
  v3_scale:{content_key:'v3_scale',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/scale-of-impact.png',media_path:'V3/scale-of-impact.png',display_order:280,is_active:true},
  v3_question:{content_key:'v3_question',section:'homepage_v3',media_url:'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/closing-question-background.png',media_path:'V3/closing-question-background.png',display_order:290,is_active:true},
};

const heroBody: Record<Locale,string> = {
  en:'The Beautiful Success Awards recognize achievements that make the world better through their success.',
  de:'Die Beautiful Success Awards würdigen Leistungen, die durch ihren Erfolg die Welt besser machen.',
  fr:'Les Beautiful Success Awards récompensent les réussites qui rendent le monde meilleur précisément grâce à leur succès.',
  ar:'تكرّم جوائز Beautiful Success الإنجازات التي تجعل العالم أفضل من خلال نجاحها نفسه.',
  zh:'Beautiful Success Awards 表彰那些因自身成功而让世界变得更好的成就。',
  es:'Los Beautiful Success Awards reconocen logros que hacen del mundo un lugar mejor precisamente a través de su éxito.',
};

const COPY: Record<Locale,Record<string,Copy>> = {
  en:{
    hero_me:{label:'A private beginning',headline:'What would you celebrate as success?'},hero_community:{label:'The intimate world',headline:'What would your community celebrate as success?'},hero_team:{label:'The shared endeavour',headline:'What would your team celebrate as success?'},hero_company:{label:'The living institution',headline:'What would your company celebrate as success?'},hero_country:{label:'The national imagination',headline:'What would your country celebrate as success?'},hero_world:{label:'The beautiful possible',headline:'What would our world celebrate as success?'},hero_universe:{label:'The beautiful impossible',headline:'What would the universe celebrate as success?'},
    site_claim:{headline:'Celebrating a better world, one Beautiful Success at a time.'},principle:{label:'The Beautiful Success Principle',headline:'The more successful it becomes, the better the world becomes.',body:'Not every success deserves to be celebrated. We recognize achievements whose positive value compounds as they grow.'},judging_intro:{label:'A new social contract, measured',headline:'Recognition begins where ordinary success metrics end.'},recognition_intro:{label:'Recognition',headline:'Scarce by design.'},voices_intro:{label:'The Beautiful Success Question',headline:'What does beautiful success mean to you?',body:'Founding voices from business, culture, science and public life will help define what humanity should celebrate as success.'},founding_edition:{label:'The Founding Edition',headline:'One global search. Seven scales. One Grand Prix.',subheadline:'Dubai · Shenzhen · Hong Kong · Vienna · London · San Francisco · Lithuania'},partners_intro:{headline:'Grateful for our Beautiful Partners'},
    v3_hero:{label:'The Institute of Beautiful Success',headline:'Beautiful Success',subheadline:'Success is not the problem.\nOur definition of it is.',body:'Discover the Institute'},
    v3_hero_images:{body:Array.from({length:12},(_,index)=>`https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/V3/${String(index+1).padStart(2,'0')}.png`).join('\n')},
    v3_principle:{label:'02 — The Principle',headline:'The more successful it becomes, the better the world becomes.',body:'For humans. For non-humans. For society. For the planet. For what comes after us.'},
    v3_principles_intro:{label:'03',headline:'The five principles that define Beautiful Success'},
    v3_principle_philanthropy:{label:'Philanthropy',headline:'What can I offer?'},v3_principle_new_focus:{label:'New Focus',headline:'What can I create?'},v3_principle_echo:{label:'Echo',headline:'Whose choices do I influence?'},v3_principle_momentum:{label:'Momentum',headline:'What can my assets set in motion?'},v3_principle_legacy:{label:'Legacy',headline:'What outlasts me?'},
    v3_scale:{label:'04 — The Scale of Impact',headline:'How far does your success reach?',subheadline:'Scale is not score.',body:'Beautiful Success is not measured by how large it becomes.\nScale tells us how far it reaches.\nThe principles tell us whether it is beautiful.'},
    v3_question:{label:'05',headline:'If you could build anything in the world…',subheadline:'what would you build?',body:'Explore the Institute|Nominate / Enter'},
  },
  de:{
    hero_me:{label:'Ein persönlicher Anfang',headline:'Was würdest du als Erfolg feiern?'},hero_community:{label:'Die Welt der Nähe',headline:'Was würde deine Community als Erfolg feiern?'},hero_team:{label:'Das gemeinsame Vorhaben',headline:'Was würde dein Team als Erfolg feiern?'},hero_company:{label:'Die lebendige Institution',headline:'Was würde dein Unternehmen als Erfolg feiern?'},hero_country:{label:'Die nationale Vorstellungskraft',headline:'Was würde dein Land als Erfolg feiern?'},hero_world:{label:'Das schön Mögliche',headline:'Was würde unsere Welt als Erfolg feiern?'},hero_universe:{label:'Das schön Unmögliche',headline:'Was würde das Universum als Erfolg feiern?'},
    site_claim:{headline:'Eine bessere Welt feiern – ein Beautiful Success nach dem anderen.'},principle:{label:'Das Beautiful Success Prinzip',headline:'Je erfolgreicher es wird, desto besser wird die Welt.',body:'Nicht jeder Erfolg verdient Applaus. Wir würdigen Leistungen, deren positiver Wert mit ihrem Wachstum zunimmt.'},judging_intro:{label:'Ein neuer Gesellschaftsvertrag, messbar gemacht',headline:'Anerkennung beginnt dort, wo gewöhnliche Erfolgskennzahlen enden.'},recognition_intro:{label:'Anerkennung',headline:'Bewusst selten.'},voices_intro:{label:'Die Beautiful Success Frage',headline:'Was bedeutet Beautiful Success für dich?',body:'Gründungsstimmen aus Wirtschaft, Kultur, Wissenschaft und öffentlichem Leben helfen zu definieren, was die Menschheit als Erfolg feiern sollte.'},founding_edition:{label:'Die Founding Edition',headline:'Eine globale Suche. Sieben Ebenen. Ein Grand Prix.',subheadline:'Dubai · Shenzhen · Hongkong · Wien · London · San Francisco · Litauen'},partners_intro:{headline:'Dankbar für unsere Beautiful Partners'},
  },
  fr:{
    hero_me:{label:'Un commencement intime',headline:'Que célébreriez-vous comme une réussite ?'},hero_community:{label:'Le monde proche',headline:'Que votre communauté célébrerait-elle comme une réussite ?'},hero_team:{label:'L’effort partagé',headline:'Que votre équipe célébrerait-elle comme une réussite ?'},hero_company:{label:'L’institution vivante',headline:'Que votre entreprise célébrerait-elle comme une réussite ?'},hero_country:{label:'L’imagination nationale',headline:'Que votre pays célébrerait-il comme une réussite ?'},hero_world:{label:'Le beau possible',headline:'Que notre monde célébrerait-il comme une réussite ?'},hero_universe:{label:'Le beau impossible',headline:'Que l’univers célébrerait-il comme une réussite ?'},
    site_claim:{headline:'Célébrer un monde meilleur, un Beautiful Success à la fois.'},principle:{label:'Le principe Beautiful Success',headline:'Plus son succès grandit, meilleur devient le monde.',body:'Tous les succès ne méritent pas d’être célébrés. Nous reconnaissons ceux dont la valeur positive augmente à mesure qu’ils grandissent.'},judging_intro:{label:'Un nouveau contrat social, mesuré',headline:'La reconnaissance commence là où s’arrêtent les métriques ordinaires du succès.'},recognition_intro:{label:'Reconnaissance',headline:'Rare par conception.'},voices_intro:{label:'La question Beautiful Success',headline:'Que signifie Beautiful Success pour vous ?',body:'Des voix fondatrices du monde des affaires, de la culture, de la science et de la vie publique aideront à définir ce que l’humanité devrait célébrer comme réussite.'},founding_edition:{label:'L’édition fondatrice',headline:'Une recherche mondiale. Sept échelles. Un Grand Prix.',subheadline:'Dubaï · Shenzhen · Hong Kong · Vienne · Londres · San Francisco · Lituanie'},partners_intro:{headline:'Reconnaissants envers nos Beautiful Partners'},
  },
  ar:{
    hero_me:{label:'بداية شخصية',headline:'ما النجاح الذي ستحتفل به أنت؟'},hero_community:{label:'العالم القريب',headline:'ما النجاح الذي سيحتفل به مجتمعك؟'},hero_team:{label:'المسعى المشترك',headline:'ما النجاح الذي سيحتفل به فريقك؟'},hero_company:{label:'المؤسسة الحية',headline:'ما النجاح الذي ستحتفل به شركتك؟'},hero_country:{label:'الخيال الوطني',headline:'ما النجاح الذي سيحتفل به بلدك؟'},hero_world:{label:'الجميل الممكن',headline:'ما النجاح الذي سيحتفل به عالمنا؟'},hero_universe:{label:'الجميل المستحيل',headline:'ما النجاح الذي سيحتفل به الكون؟'},
    site_claim:{headline:'نحتفي بعالم أفضل، نجاح جميل واحداً تلو الآخر.'},principle:{label:'مبدأ Beautiful Success',headline:'كلما ازداد نجاحه، أصبح العالم أفضل.',body:'ليس كل نجاح جديراً بالاحتفاء. نحن نكرّم الإنجازات التي تتضاعف قيمتها الإيجابية كلما نمت.'},judging_intro:{label:'عقد اجتماعي جديد، قابل للقياس',headline:'يبدأ التقدير حيث تنتهي مقاييس النجاح التقليدية.'},recognition_intro:{label:'التقدير',headline:'نادر عن قصد.'},voices_intro:{label:'سؤال Beautiful Success',headline:'ماذا يعني Beautiful Success بالنسبة لك؟',body:'تساعد أصوات مؤسسة من الأعمال والثقافة والعلم والحياة العامة في تحديد ما ينبغي للبشرية أن تحتفي به بوصفه نجاحاً.'},founding_edition:{label:'النسخة التأسيسية',headline:'بحث عالمي واحد. سبعة مستويات. جائزة كبرى واحدة.',subheadline:'دبي · شينزن · هونغ كونغ · فيينا · لندن · سان فرانسيسكو · ليتوانيا'},partners_intro:{headline:'ممتنون لشركائنا في Beautiful Success'},
  },
  zh:{
    hero_me:{label:'从个人开始',headline:'你会把什么视为值得庆祝的成功？'},hero_community:{label:'亲近的世界',headline:'你的社区会把什么视为值得庆祝的成功？'},hero_team:{label:'共同的事业',headline:'你的团队会把什么视为值得庆祝的成功？'},hero_company:{label:'有生命力的组织',headline:'你的公司会把什么视为值得庆祝的成功？'},hero_country:{label:'国家想象力',headline:'你的国家会把什么视为值得庆祝的成功？'},hero_world:{label:'美好的可能',headline:'我们的世界会把什么视为值得庆祝的成功？'},hero_universe:{label:'美好的不可能',headline:'宇宙会把什么视为值得庆祝的成功？'},
    site_claim:{headline:'一次庆祝一个 Beautiful Success，让世界变得更好。'},principle:{label:'Beautiful Success 原则',headline:'它越成功，世界就越美好。',body:'并非所有成功都值得庆祝。我们认可那些随着成长而不断放大正向价值的成就。'},judging_intro:{label:'一份可衡量的新社会契约',headline:'当普通的成功指标失效时，真正的认可才开始。'},recognition_intro:{label:'认可',headline:'稀缺，是刻意的。'},voices_intro:{label:'Beautiful Success 之问',headline:'Beautiful Success 对你意味着什么？',body:'来自商业、文化、科学与公共领域的创始之声，将共同定义人类究竟应该庆祝怎样的成功。'},founding_edition:{label:'创始届',headline:'一次全球搜寻。七个尺度。一个 Grand Prix。',subheadline:'迪拜 · 深圳 · 香港 · 维也纳 · 伦敦 · 旧金山 · 立陶宛'},partners_intro:{headline:'感谢我们的 Beautiful Partners'},
  },
  es:{
    hero_me:{label:'Un comienzo personal',headline:'¿Qué celebrarías tú como éxito?'},hero_community:{label:'El mundo cercano',headline:'¿Qué celebraría tu comunidad como éxito?'},hero_team:{label:'El esfuerzo compartido',headline:'¿Qué celebraría tu equipo como éxito?'},hero_company:{label:'La institución viva',headline:'¿Qué celebraría tu empresa como éxito?'},hero_country:{label:'La imaginación nacional',headline:'¿Qué celebraría tu país como éxito?'},hero_world:{label:'Lo bellamente posible',headline:'¿Qué celebraría nuestro mundo como éxito?'},hero_universe:{label:'Lo bellamente imposible',headline:'¿Qué celebraría el universo como éxito?'},
    site_claim:{headline:'Celebrando un mundo mejor, un Beautiful Success a la vez.'},principle:{label:'El principio Beautiful Success',headline:'Cuanto más éxito tiene, mejor se vuelve el mundo.',body:'No todo éxito merece ser celebrado. Reconocemos logros cuyo valor positivo se multiplica a medida que crecen.'},judging_intro:{label:'Un nuevo contrato social, medido',headline:'El reconocimiento comienza donde terminan las métricas convencionales del éxito.'},recognition_intro:{label:'Reconocimiento',headline:'Escaso por diseño.'},voices_intro:{label:'La pregunta Beautiful Success',headline:'¿Qué significa Beautiful Success para ti?',body:'Voces fundadoras de los negocios, la cultura, la ciencia y la vida pública ayudarán a definir qué debería celebrar la humanidad como éxito.'},founding_edition:{label:'La Edición Fundadora',headline:'Una búsqueda global. Siete escalas. Un Grand Prix.',subheadline:'Dubái · Shenzhen · Hong Kong · Viena · Londres · San Francisco · Lituania'},partners_intro:{headline:'Agradecidos por nuestros Beautiful Partners'},
  },
};

export function awardSiteDefaults(locale: Locale): AwardSiteContent[] {
  return Object.keys(BASE).map((key) => ({
    ...BASE[key],
    locale,
    label: COPY[locale][key]?.label ?? COPY.en[key]?.label ?? null,
    headline: COPY[locale][key]?.headline ?? COPY.en[key]?.headline ?? null,
    subheadline: COPY[locale][key]?.subheadline ?? COPY.en[key]?.subheadline ?? null,
    body: key.startsWith('hero_') ? heroBody[locale] : COPY[locale][key]?.body ?? COPY.en[key]?.body ?? null,
  }));
}
