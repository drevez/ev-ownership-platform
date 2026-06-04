type SearchPageProps = {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({
  searchParams
}: SearchPageProps) {
  const query = searchParams.q || ''

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <p className="text-zinc-500 mb-4">
          Resultados para
        </p>

        <h1 className="text-5xl font-bold mb-12">
          {query}
        </h1>

        {/* depois adicionas grid de resultados */}
      </div>
    </main>
  )
}