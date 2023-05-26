import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import ProductGrid from '~/components/ProductGrid';

export type BadType = {
  [index: string]: any;
};

// Get data
export async function loader({params, context, request}: BadType) {
  //   console.log('params', params);
  //   console.log('request', request);
  const {handle} = params;

  const searchParams = new URL(request.url).searchParams;
  const cursor = searchParams.get('cursor');

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      cursor,
    },
  });

  // Handle 404s
  if (!collection) {
    throw new Response(null, {status: 404});
  }

  // json is a Remix utility for creating application/json responses
  // https://remix.run/docs/en/v1/utils/json
  return json({collection});
}

/**
 *
 * SEO related
 */
const seo = ({data}: BadType) => ({
  title: data?.collection?.title,
  description: data?.collection?.description.substr(0, 154),
});

// This is looked for by Shopify's SEO component and injects meta information into the Head
export const handle = {
  seo,
};

export default function Collection() {
  const {collection} = useLoaderData();
  return (
    <>
      <header className="grid w-full justify-items-start gap-8 py-8">
        <h1 className="inline-block whitespace-pre-wrap text-4xl font-bold">
          {collection.title}
        </h1>

        {collection.description && (
          <div className="flex w-full items-baseline justify-between">
            <div>
              <p className="inherit text-copy inline-block max-w-prose whitespace-pre-wrap">
                {collection.description}
              </p>
            </div>
          </div>
        )}
      </header>
      <ProductGrid
        collection={collection}
        url={`/collections/${collection.handle}`}
      />
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      products(first: 4, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          publishedAt
          handle
          variants(first: 1) {
            nodes {
              id
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
