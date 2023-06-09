import {useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';
import ProductCard from './ProductCard';

type ProductGridArgs = {
  collection: any;
  url: any;
};

export default function ProductGrid({collection, url}: ProductGridArgs) {
  //   console.log('collection', collection);
  const {products: productsRaw} = collection;
  //   console.log('productsRaw', productsRaw);

  const [nextPage, setNextPage] = useState(productsRaw.pageInfo.hasNextPage);
  const [endCursor, setEndCursor] = useState(productsRaw.pageInfo.endCursor);
  const [products, setProducts] = useState(productsRaw.nodes || []);
  console.log('productsState', products);

  // For making client-side requests
  // https://remix.run/docs/en/v1/hooks/use-fetcher
  const fetcher = useFetcher();

  function fetchMoreProducts() {
    // index differentiates index routes from their parent layout routes
    // https://remix.run/docs/en/v1/guides/routing#what-is-the-index-query-param
    fetcher.load(`${url}?index&cursor=${endCursor}`);
    // cursor is read inside of collections.$handle route
  }

  useEffect(() => {
    if (!fetcher.data) return;
    const {products: productsRaw} = fetcher.data.collection;
    setProducts((prev: any) => [...prev, ...productsRaw.nodes]);
    setNextPage(productsRaw.pageInfo.hasNextPage);
    setEndCursor(productsRaw.pageInfo.endCursor);
  }, [fetcher.data]);

  return (
    <section className="grid w-full gap-4 md:gap-8">
      <div className="grid grid-flow-row grid-cols-2 gap-2 gap-y-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {nextPage && (
        <div className="mt-6 flex items-center justify-center">
          <button
            className="inline-block w-full cursor-pointer rounded border px-6 py-3 text-center font-medium"
            disabled={fetcher.state !== 'idle'}
            onClick={fetchMoreProducts}
          >
            {fetcher.state !== 'idle' ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </section>
  );
}
