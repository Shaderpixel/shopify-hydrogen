import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

export function meta() {
  return [
    {title: 'Hydrogen'},
    {description: 'A custom storefront powered by Hydrogen'},
  ];
}

export async function loader({context}: {[index: string]: any}) {
  // this runs server side
  return context.storefront.query(COLLECTIONS_QUERY);
}

// site homepage
export default function Index() {
  const {collections} = useLoaderData();
  //   console.debug('collections', collections);

  return (
    <section className="w-full gap-4">
      <h2 className="text-lead max-w-prose whitespace-pre-wrap font-bold">
        Collections
      </h2>
      <div className="grid grid-flow-row grid-cols-1 gap-2 gap-y-6 sm:grid-cols-3 md:gap-4 lg:gap-6">
        {collections.nodes.map((collection: any) => {
          return (
            <Link to={`/collections/${collection.handle}`} key={collection.id}>
              <div className="grid gap-4">
                {collection?.image && (
                  <Image
                    alt={`Image of ${collection.title}`}
                    data={collection.image}
                    key={collection.id}
                    sizes="(max-width: 32em) 100vw, 33vw"
                    crop="center"
                  />
                )}
                <h2 className="text-copy max-w-prose whitespace-pre-wrap font-medium">
                  {collection.title}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const COLLECTIONS_QUERY = `#graphql
	query FeatureCollections {
		collections (first: 3, query: "collection_type:smart") {
			nodes {
				id
				title
				handle
				image {
          altText
          width
          height
          url
        }
			}
		}
	}
`;
