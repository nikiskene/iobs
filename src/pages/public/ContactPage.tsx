// src/pages/public/ContactPage.tsx
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7eddd] px-6 py-32 text-[#24171a]">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8c203d]">Contact</p>
        <h1 className="mt-7 max-w-4xl font-serif text-6xl leading-[0.95] tracking-tight md:text-8xl">
          Begin a beautiful conversation.
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-8 text-[#735e61]">
          The integrated contact form and admin-inbox workflow will arrive in the contact phase of the public beta.
        </p>
        <a className="mt-10 inline-block border-b border-[#8c203d] pb-2 text-xs uppercase tracking-[0.18em]" href="mailto:hello@worldos.institute">
          Contact the Institute
        </a>
      </div>
    </main>
  );
}
