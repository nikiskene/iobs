export const PRINCIPLE_IDS = ['offer', 'create', 'echo', 'momentum', 'legacy'] as const;
export const NOMINATION_RAYS = [
  ['me', 'Me', 'أنا'], ['circle', 'My Community', 'مجتمعي'],
  ['teams', 'My Team', 'فريقي'], ['organizations', 'My Company', 'شركتي'],
  ['country', 'My Country', 'بلدي'], ['society', 'The World', 'العالم'],
  ['world', 'Space', 'الفضاء'],
] as const;

const en = {
  ray: 'Which ray best fits this nomination?', choose: 'Choose a ray',
  rayHelp: 'Choose the main scale at which this person, organization, or project makes a difference.',
  title: 'What makes this a Beautiful Success?',
  guidance: 'At least one principle must be answered. The more principles you can speak to, the stronger your submission. Share what you know; you can leave the others blank.',
  required: 'Please answer at least one of the five principles.',
  error: 'Your nomination could not be sent. Your answers are still here. Please try again.',
  example: 'For example', limit: 'Up to 750 characters per answer.',
  principles: [
    ['OFFER', 'What do they offer to the world?', 'What contribution begins with “What can I offer to the world?” rather than “What’s in it for me?” What do they give, share, or make possible for others?', 'A company dedicates 1% of its profit to community-led projects.'],
    ['CREATE', 'What do they create that does not need protecting?', 'Protection is a basic human need. Where have they been able to direct resources towards creation instead of protecting ownership, exclusivity, or advantage?', 'A project makes useful products from discarded plastic bottles collected on Ghana’s beaches, creating value from materials no one else wants.'],
    ['ECHO', 'What changes in others because of what they do?', 'Beyond their associations and network, how do they influence what other people or organizations say, believe, or do?', 'A school’s approach to education makes children want to spend more time at school.'],
    ['MOMENTUM', 'What do they set in motion with what they already have?', 'How do they use their space, tools, knowledge, or other assets to make something possible that was not available before?', 'A company turns an unused part of its premises into a playground for local children.'],
    ['LEGACY', 'If they stopped tomorrow, what would be missing?', 'When they leave the room, what stays? What lasting difference have they made, and what could not simply be replaced by another similar offer?', 'If a university closed, students could study elsewhere, but a unique learning community, culture, or opportunity might disappear with it.'],
  ],
};
const ar: typeof en = {
  ray: 'أي نطاق يناسب هذا الترشيح أكثر؟', choose: 'اختر نطاقاً',
  rayHelp: 'اختر النطاق الرئيسي الذي يُحدث فيه هذا الشخص أو المؤسسة أو المشروع فرقاً.',
  title: 'ما الذي يجعل هذا نجاحاً جميلاً؟',
  guidance: 'يجب الإجابة عن مبدأ واحد على الأقل. كلما تناولت مبادئ أكثر، أصبح ترشيحك أقوى. شارك ما تعرفه، ويمكنك ترك البقية فارغة.',
  required: 'يرجى الإجابة عن مبدأ واحد على الأقل من المبادئ الخمسة.',
  error: 'تعذّر إرسال ترشيحك. إجاباتك محفوظة في النموذج. يرجى المحاولة مجدداً.',
  example: 'مثال', limit: 'حتى 750 حرفاً لكل إجابة.',
  principles: [
    ['العطاء · OFFER', 'ماذا يقدمون للعالم؟', 'ما المساهمة التي تبدأ بسؤال «ماذا يمكنني أن أقدم للعالم؟» بدلاً من «ماذا سأستفيد؟» ما الذي يمنحونه أو يشاركونه أو يتيحونه للآخرين؟', 'تخصص شركة 1% من أرباحها لمشاريع يقودها المجتمع المحلي.'],
    ['الإبداع · CREATE', 'ماذا يبتكرون بحيث لا يحتاج إلى حماية؟', 'الحماية حاجة إنسانية أساسية. أين استطاعوا توجيه مواردهم نحو الإبداع بدلاً من حماية الملكية أو الحصرية أو الميزة التنافسية؟', 'يصنع مشروع منتجات مفيدة من زجاجات بلاستيكية مهملة جُمعت من شواطئ غانا، ليخلق قيمة من مواد لم يعد أحد يريدها.'],
    ['الصدى · ECHO', 'ما الذي يتغير لدى الآخرين بسبب ما يفعلونه؟', 'بعيداً عن علاقاتهم وشبكاتهم، كيف يؤثرون فيما يقوله الآخرون أو يؤمنون به أو يفعلونه؟', 'يجعل نهج مدرسة في التعليم الأطفال يرغبون فعلاً في قضاء وقت أطول فيها.'],
    ['الزخم · MOMENTUM', 'ماذا يحرّكون بما يمتلكونه بالفعل؟', 'كيف يستخدمون مساحاتهم أو أدواتهم أو معارفهم أو مواردهم الأخرى لإتاحة شيء لم يكن متاحاً من قبل؟', 'تحوّل شركة مساحة غير مستخدمة في مقرها إلى ملعب لأطفال الحي.'],
    ['الإرث · LEGACY', 'لو توقفوا غداً، ما الذي سنفتقده؟', 'عندما يغادرون الغرفة، ماذا يبقى؟ ما الفرق الدائم الذي أحدثوه، وما الذي لا يمكن تعويضه ببساطة ببديل مشابه؟', 'إذا أُغلقت جامعة، قد يدرس طلابها في جامعة أخرى، لكن مجتمعاً تعليمياً أو ثقافة أو فرصة فريدة قد تختفي معها.'],
  ],
};
export function getNominationContent(locale: string) { return locale === 'ar' ? ar : en; }
