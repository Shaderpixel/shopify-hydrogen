import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {ReactElement} from 'react';

export default function ProductCard({product}: {product: any}): ReactElement {
  //   console.debug('product', product);
  const {price, compareAtPrice} = product.variants?.nodes[0] || {};
  const isDiscounted = compareAtPrice?.amount > price?.amount;

  return (
    <Link to={`/products/${product.handle}`}>
      <div className="grid gap-6">
        <div className="relative rounded shadow-sm">
          {isDiscounted && (
            <span className="text-notice absolute right-0 top-0 m-4 text-right text-xs text-red-600 subpixel-antialiased">
              Sale
            </span>
          )}
          <Image data={product.variants.nodes[0].image} alt={product.title} />
        </div>
        <div className="grid gap-1">
          <h3 className="text-copy w-full max-w-prose overflow-hidden text-ellipsis whitespace-nowrap ">
            {product.title}
          </h3>
          <div className="flex gap-4">
            <span className="inherit text-copy flex max-w-prose gap-4 whitespace-pre-wrap">
              <Money withoutTrailingZeros data={price} />
              {isDiscounted && (
                <Money
                  className="line-through opacity-50"
                  withoutTrailingZeros
                  data={compareAtPrice}
                />
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
