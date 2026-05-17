export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    return (    <div>
      Surah {id}
    </div>  
    );
}