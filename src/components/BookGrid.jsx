import BookCard from './BookCard';

export default function BookGrid({ books, onAddToCart, cols = 4 }) {
  // Filtrer les éléments null/undefined avant le rendu
  const validBooks = books?.filter(Boolean) ?? [];

  if (validBooks.length === 0) {
    return <div className="py-10 text-center text-gray-500">Aucun livre trouvé.</div>;
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[cols] || gridCols[4]} gap-6`}>
      {validBooks.map((book) => (
        <BookCard key={book.id} book={book} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}