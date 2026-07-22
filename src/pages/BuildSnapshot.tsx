// src/pages/BuildSnapshot.tsx
export default function BuildSnapshot() {
  const tree = `
project/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── hooks/
│   │   └── useAuth.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── types.ts
│   └── pages/
│       ├── admin/
│       │   ├── CategoriesAdmin.tsx
│       │   ├── HomepageCMS.tsx
│       │   ├── TeamAdmin.tsx
│       │   └── ThesesAdmin.tsx
│       ├── auth/
│       │   └── LoginPage.tsx
│       ├── dashboard/
│       │   ├── ChatPage.tsx
│       │   ├── MembersPage.tsx
│       │   ├── MyThesesPage.tsx
│       │   ├── ProfilePage.tsx
│       │   └── ThesisEditor.tsx
│       └── public/
│           ├── AboutPage.tsx
│           ├── HomePage.tsx
│           ├── JoinPage.tsx
│           ├── TeamPage.tsx
│           └── ThesisPage.tsx
└── supabase/
    └── migrations/
        ├── 20260505171015_001_create_profiles.sql
        ├── 20260505171036_002_create_thesis_categories.sql
        ├── 20260505171058_003_create_theses.sql
        ├── 20260505171127_004_create_thesis_media.sql
        ├── 20260505171142_005_create_homepage_sections.sql
        ├── 20260505171150_006_create_chat_messages.sql
        └── 20260505171219_007_seed_data.sql
`;

  return (
    <main className="min-h-screen bg-black p-8 text-zinc-200">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Build Snapshot</h1>

        <textarea
          readOnly
          value={tree}
          className="h-[80vh] w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-6 font-mono text-sm leading-6 text-zinc-300"
        />
      </div>
    </main>
  );
}