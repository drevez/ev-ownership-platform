interface LegalSection {
  title: string
  paragraphs: string[]
}

interface LegalPageContent {
  title: string
  description: string
  updated: string
  sections: LegalSection[]
}

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <main className="bg-white text-zinc-950">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-emerald-700">MotorZero</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600">
          {content.description}
        </p>
        <p className="mt-4 text-sm text-zinc-500">{content.updated}</p>

        <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
          {content.sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-7 text-zinc-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
