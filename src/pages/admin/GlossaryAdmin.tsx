// src/pages/admin/GlossaryAdmin.tsx
const glossaryItems = [
  {
    term: 'Explorer',
    definition:
      'A registered member of the WorldOS community. Explorers can participate, contribute, connect and eventually join expeditions or conversations.',
  },
  {
    term: 'Expedition',
    definition:
      'A curated multi-day journey into an innovation ecosystem. Expeditions are not events; they are structured field missions built around people, places and conversations.',
  },
  {
    term: 'Application',
    definition:
      'A request to join an expedition. Applications are reviewed personally and help determine whether someone adds value to the group.',
  },
  {
    term: 'Conversation',
    definition:
      'A curated session, dinner, field visit, workshop or roundtable. Conversations are structured knowledge objects and may belong to an expedition or event.',
  },
  {
    term: 'Event',
    definition:
      'A public scheduled gathering, usually smaller and simpler than an expedition. Events may include talks, salons, livestreams or open community sessions.',
  },
  {
    term: 'Thesis',
    definition:
      'A structured idea, argument or perspective about how the world is changing. Theses can connect to topics, conversations and expeditions.',
  },
  {
    term: 'Topic',
    definition:
      'A cross-cutting subject such as AI, trust, cities, education, democracy or identity. Topics connect people, theses, conversations and expeditions.',
  },
  {
    term: 'Chat',
    definition:
      'The informal community messaging space for registered users. Chat is not the same as a Conversation.',
  },
  {
    term: 'Team',
    definition:
      'Publicly visible people behind WorldOS or associated with the institute. Team members may also be Explorers.',
  },
  {
    term: 'Curator Desk',
    definition:
      'The internal admin environment for managing the WorldOS system. Currently still implemented as Admin.',
  },
];

export default function GlossaryAdmin() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Glossary</h1>

      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">
        The official language of WorldOS. Use these terms consistently across
        navigation, admin, public pages and product decisions.
      </p>

      <div className="mt-8 grid gap-4">
        {glossaryItems.map((item) => (
          <div
            key={item.term}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
          >
            <h2 className="text-lg font-semibold text-white">{item.term}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}