// src/content/localizedAwardContent.ts
import { useLocale, type Locale } from '../providers/LocaleProvider';
import type { ImpactScale } from '../providers/ImpactScaleProvider';

type Category = { slug:ImpactScale; name:string; definition:string; fee:string; examples:string };
type Test = { number:string; title:string; copy:string };
type Recognition = [string,string];

type Localized = { categories:Category[]; test:Test[]; recognition:Recognition[] };

const fees = ['$250','$400','$750','$1,500','$3,000','$5,000','$7,500'];
const slugs:ImpactScale[] = ['me','circle','teams','organizations','country','society','world'];

const DATA:Record<Locale,{names:string[];defs:string[];examples:string[];test:[string,string][];recognition:Recognition[]}> = {
  en:{
    names:['Just Me','My Community','My Team','My Company','My Country','The Whole World','Beyond Our World'],
    defs:['Personal transformation, courage, recovery or a life intentionally rebuilt.','Achievements that strengthen belonging, dignity, care and shared life.','Extraordinary results created through an unusually beautiful way of working.','Commercial achievement that creates increasing value for people and planet.','Institutions, policies and national initiatives that expand collective possibility.','Proven achievements with meaningful global or planetary consequence.','Space, frontier science and achievements expanding humanity’s horizon responsibly.'],
    examples:['A success that makes one life more fully alive.','A success whose value grows as more people belong.','A success that makes collaboration more human.','The more successful the company, the better its consequence.','A success that strengthens a country and its future generations.','A success whose positive impact compounds across borders.','A success that enlarges possibility without abandoning responsibility.'],
    test:[['What became possible?','What do you offer?'],['Who benefits as it grows?','What is the echo you create?'],['What does success cost?','What did you unlock — and what did it require?'],['Can the value endure?','Is your growth good for humans and non-humans?'],['Does growth improve the system?','What outlasts you?'],['Moonshot','Your idea does not fit the criteria — yet creates Beautiful Success in a way we did not see coming.']],
    recognition:[['Selected','Meets the standard and enters the annual record.'],['Distinguished','A defining example within its scale.'],['Beautiful Success Laureate','The rare achievement that changes what success can mean.'],['Grand Prix','The most distinguished approach to create and scale beautiful success.']],
  },
  de:{
    names:['Nur ich','Meine Community','Mein Team','Mein Unternehmen','Mein Land','Die ganze Welt','Jenseits unserer Welt'],
    defs:['Persönliche Transformation, Mut, Genesung oder ein bewusst neu aufgebautes Leben.','Leistungen, die Zugehörigkeit, Würde, Fürsorge und gemeinsames Leben stärken.','Außergewöhnliche Ergebnisse durch eine außergewöhnlich gute Art der Zusammenarbeit.','Wirtschaftlicher Erfolg, der wachsenden Wert für Menschen und den Planeten schafft.','Institutionen, Politik und nationale Initiativen, die kollektive Möglichkeiten erweitern.','Nachgewiesene Leistungen mit bedeutender globaler oder planetarer Wirkung.','Raumfahrt, Grenzwissenschaft und Leistungen, die den Horizont der Menschheit verantwortungsvoll erweitern.'],
    examples:['Ein Erfolg, der ein Leben lebendiger macht.','Ein Erfolg, dessen Wert wächst, je mehr Menschen dazugehören.','Ein Erfolg, der Zusammenarbeit menschlicher macht.','Je erfolgreicher das Unternehmen, desto besser seine Wirkung.','Ein Erfolg, der ein Land und seine künftigen Generationen stärkt.','Ein Erfolg, dessen positive Wirkung über Grenzen hinweg zunimmt.','Ein Erfolg, der Möglichkeiten erweitert, ohne Verantwortung aufzugeben.'],
    test:[['Was wurde möglich?','Was bietest du an?'],['Wer profitiert, wenn es wächst?','Welches Echo erzeugst du?'],['Was kostet der Erfolg?','Was hast du ermöglicht — und was hat es verlangt?'],['Kann der Wert bestehen?','Ist dein Wachstum gut für Menschen und Nicht-Menschen?'],['Verbessert Wachstum das System?','Was bleibt über dich hinaus?'],['Moonshot','Deine Idee passt nicht in die Kriterien — und schafft dennoch Beautiful Success auf eine Weise, die wir nicht erwartet haben.']],
    recognition:[['Ausgewählt','Erfüllt den Standard und wird Teil des Jahresarchivs.'],['Distinguished','Ein prägendes Beispiel innerhalb seiner Ebene.'],['Beautiful Success Laureate','Die seltene Leistung, die verändert, was Erfolg bedeuten kann.'],['Grand Prix','Der herausragendste Ansatz, Beautiful Success zu schaffen und zu skalieren.']],
  },
  fr:{
    names:['Moi','Ma communauté','Mon équipe','Mon entreprise','Mon pays','Le monde entier','Au-delà de notre monde'],
    defs:['Transformation personnelle, courage, reconstruction ou vie réinventée intentionnellement.','Réussites qui renforcent l’appartenance, la dignité, le soin et la vie partagée.','Résultats extraordinaires obtenus par une manière de travailler exceptionnellement belle.','Réussite commerciale qui crée une valeur croissante pour les personnes et la planète.','Institutions, politiques et initiatives nationales qui élargissent les possibilités collectives.','Réalisations éprouvées ayant un impact mondial ou planétaire significatif.','Espace, science de pointe et réalisations qui élargissent de manière responsable l’horizon de l’humanité.'],
    examples:['Une réussite qui rend une vie plus pleinement vivante.','Une réussite dont la valeur augmente à mesure que davantage de personnes appartiennent.','Une réussite qui rend la collaboration plus humaine.','Plus l’entreprise réussit, meilleure est sa conséquence.','Une réussite qui renforce un pays et ses générations futures.','Une réussite dont l’impact positif s’amplifie au-delà des frontières.','Une réussite qui élargit les possibles sans abandonner la responsabilité.'],
    test:[['Qu’est-ce qui est devenu possible ?','Qu’offrez-vous ?'],['Qui en bénéficie à mesure que cela grandit ?','Quel écho créez-vous ?'],['Quel est le coût du succès ?','Qu’avez-vous débloqué — et qu’a-t-il fallu ?'],['La valeur peut-elle durer ?','Votre croissance est-elle bonne pour les humains et les non-humains ?'],['La croissance améliore-t-elle le système ?','Qu’est-ce qui vous survivra ?'],['Moonshot','Votre idée ne correspond pas aux critères — mais crée Beautiful Success d’une manière que nous n’avions pas anticipée.']],
    recognition:[['Sélectionné','Répond au standard et entre dans les archives annuelles.'],['Distingué','Un exemple déterminant à son échelle.'],['Lauréat Beautiful Success','La rare réussite qui change ce que le succès peut signifier.'],['Grand Prix','L’approche la plus remarquable pour créer et déployer Beautiful Success.']],
  },
  ar:{
    names:['أنا','مجتمعي','فريقي','شركتي','بلدي','العالم كله','ما وراء عالمنا'],
    defs:['تحول شخصي أو شجاعة أو تعافٍ أو حياة أُعيد بناؤها بوعي.','إنجازات تعزز الانتماء والكرامة والرعاية والحياة المشتركة.','نتائج استثنائية تحققت من خلال طريقة عمل إنسانية وجميلة بصورة غير عادية.','نجاح تجاري يخلق قيمة متزايدة للناس وللكوكب.','مؤسسات وسياسات ومبادرات وطنية توسّع الإمكانات الجماعية.','إنجازات مثبتة ذات أثر عالمي أو كوكبي ملموس.','الفضاء وعلوم الحدود والإنجازات التي توسّع أفق البشرية بمسؤولية.'],
    examples:['نجاح يجعل حياة واحدة أكثر امتلاءً وحيوية.','نجاح تزداد قيمته كلما ازداد عدد المنتمين إليه.','نجاح يجعل التعاون أكثر إنسانية.','كلما نجحت الشركة أكثر، تحسنت آثارها.','نجاح يقوّي بلداً وأجياله القادمة.','نجاح يتضاعف أثره الإيجابي عبر الحدود.','نجاح يوسّع الإمكانات دون التخلي عن المسؤولية.'],
    test:[['ما الذي أصبح ممكناً؟','ماذا تقدم؟'],['من يستفيد كلما نما؟','ما الصدى الذي تصنعه؟'],['ما تكلفة النجاح؟','ما الذي أطلقته — وما الذي تطلبه؟'],['هل يمكن أن تدوم القيمة؟','هل نموك جيد للبشر ولغير البشر؟'],['هل يحسّن النمو النظام؟','ما الذي يبقى بعدك؟'],['Moonshot','فكرتك لا تنطبق عليها المعايير — لكنها تصنع Beautiful Success بطريقة لم نتوقعها.']],
    recognition:[['مختار','يحقق المعيار ويدخل السجل السنوي.'],['متميز','مثال حاسم ضمن مستواه.'],['Beautiful Success Laureate','الإنجاز النادر الذي يغير معنى النجاح.'],['Grand Prix','النهج الأكثر تميزاً لخلق Beautiful Success وتوسيع نطاقه.']],
  },
  zh:{
    names:['我自己','我的社区','我的团队','我的公司','我的国家','整个世界','超越我们的世界'],
    defs:['个人转变、勇气、复原，或有意识地重建一种生活。','强化归属感、尊严、关怀与共同生活的成就。','通过一种格外美好的协作方式创造出的卓越成果。','在商业成功的同时，为人类与地球创造不断增长的价值。','拓展集体可能性的制度、政策与国家级行动。','具有真实全球或行星影响的经验证成就。','以负责任方式拓展人类边界的太空、前沿科学与重大成就。'],
    examples:['一种让一个人的生命更加完整鲜活的成功。','一种随着更多人加入而价值持续增长的成功。','一种让合作更具人性的成功。','公司越成功，其带来的结果越美好。','一种强化国家及其未来世代的成功。','一种跨越国界持续放大正向影响的成功。','一种扩展可能性、同时不放弃责任的成功。'],
    test:[['什么变得可能？','你提供了什么？'],['随着它成长，谁会受益？','你创造了怎样的回响？'],['成功的代价是什么？','你解锁了什么——又付出了什么？'],['价值能否持续？','你的增长对人类和非人类生命都有益吗？'],['增长是否改善了系统？','什么会在你之后继续存在？'],['Moonshot','你的想法不符合现有标准——却以我们未曾预见的方式创造了 Beautiful Success。']],
    recognition:[['入选','达到标准并进入年度记录。'],['杰出','在其尺度中具有定义性的案例。'],['Beautiful Success Laureate','改变“成功”可以意味着什么的罕见成就。'],['Grand Prix','创造并规模化 Beautiful Success 的最卓越方法。']],
  },
  es:{
    names:['Yo','Mi comunidad','Mi equipo','Mi empresa','Mi país','El mundo entero','Más allá de nuestro mundo'],
    defs:['Transformación personal, valentía, recuperación o una vida reconstruida de forma intencionada.','Logros que fortalecen pertenencia, dignidad, cuidado y vida compartida.','Resultados extraordinarios creados mediante una forma de trabajar excepcionalmente humana y bella.','Éxito comercial que genera un valor creciente para las personas y el planeta.','Instituciones, políticas e iniciativas nacionales que amplían la posibilidad colectiva.','Logros probados con consecuencias globales o planetarias significativas.','Espacio, ciencia de frontera y logros que amplían responsablemente el horizonte de la humanidad.'],
    examples:['Un éxito que hace que una vida esté más plenamente viva.','Un éxito cuyo valor crece a medida que más personas pertenecen.','Un éxito que hace la colaboración más humana.','Cuanto más exitosa es la empresa, mejor es su consecuencia.','Un éxito que fortalece a un país y a sus futuras generaciones.','Un éxito cuyo impacto positivo se multiplica a través de las fronteras.','Un éxito que amplía posibilidades sin abandonar la responsabilidad.'],
    test:[['¿Qué se volvió posible?','¿Qué ofreces?'],['¿Quién se beneficia cuando crece?','¿Qué eco creas?'],['¿Qué cuesta el éxito?','¿Qué desbloqueaste — y qué exigió?'],['¿Puede perdurar el valor?','¿Tu crecimiento es bueno para humanos y no humanos?'],['¿El crecimiento mejora el sistema?','¿Qué perdura más allá de ti?'],['Moonshot','Tu idea no encaja en los criterios — pero crea Beautiful Success de una forma que no habíamos previsto.']],
    recognition:[['Seleccionado','Cumple el estándar y entra en el registro anual.'],['Distinguido','Un ejemplo definitorio dentro de su escala.'],['Beautiful Success Laureate','El logro excepcional que cambia lo que puede significar el éxito.'],['Grand Prix','El enfoque más distinguido para crear y escalar Beautiful Success.']],
  },
};

export function useLocalizedAwardContent():Localized {
  const { locale } = useLocale();
  const data = DATA[locale];
  return {
    categories: slugs.map((slug,index) => ({ slug, name:data.names[index], definition:data.defs[index], fee:fees[index], examples:data.examples[index] })),
    test: data.test.map(([title,copy],index) => ({ number:String(index+1).padStart(2,'0'), title, copy })),
    recognition:data.recognition,
  };
}
