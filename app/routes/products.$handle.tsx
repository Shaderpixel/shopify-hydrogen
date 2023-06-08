import {useFetcher, useLoaderData, useMatches} from '@remix-run/react';
import {MediaFile, Money, ShopPayButton} from '@shopify/hydrogen-react';
import {json} from '@shopify/remix-oxygen';
import ProductOptions from 'app/components/ProductOptions';
import {BadTypeObject, OptionsArray} from 'types';

function PrintJson({data}: BadTypeObject) {
  return (
    <details className="my-2 p-4 outline outline-2 outline-blue-300">
      <summary>Product JSON</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}

// gets all the params, context, requests and query data
export async function loader({params, context, request}: BadTypeObject) {
  const {handle} = params;
  const searchParams = new URL(request.url).searchParams;
  const selectedOptions: OptionsArray = [];

  // get storeDomain to use the Shop Pay Button
  const storeDomain = context.storefront.getShopifyDomain();

  // set selected options from the query string
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions,
    },
  });

  // return 404 upon non-existent product id
  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // optionally set a default variant so you always have an "orderable product selected"
  const selectedVariant =
    product.selectedVariant ?? product?.variants?.nodes[0];

  return json({handle, product, selectedVariant, storeDomain});
}

function ProductForm({variantId}: BadTypeObject) {
  const [root] = useMatches();
  const selectedLocale = root?.data?.selectedLocale;
  const fetcher = useFetcher();

  const lines = [{merchandiseId: variantId, quantity: 1}];

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="cartAction" value={'ADD_TO_CART'} />
      <input
        type="hidden"
        name="countryCode"
        value={selectedLocale?.country ?? 'US'}
      />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <button className="w-full max-w-[400px] rounded-md bg-black px-6 py-3 text-center font-medium text-white">
        Add to Bag
      </button>
    </fetcher.Form>
  );
}

export default function ProductHandle() {
  const {handle, product, selectedVariant, storeDomain} = useLoaderData();

  // flag of whether the selected variant can be purchased
  const orderable = selectedVariant?.availableForSale || false;

  return (
    <section className="grid w-full gap-4 px-6 md:gap-8 md:px-8 lg:px-12">
      <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-20">
        <div className="grid md:w-full  md:grid-flow-row md:grid-cols-2 md:overflow-x-hidden md:p-0 lg:col-span-2">
          <div className="card-image aspect-square w-[80vw] snap-center rounded shadow md:col-span-2 md:w-full">
            <ProductGallery media={product.media.nodes} />
          </div>
        </div>
        <div className="top-[6rem] grid max-w-xl gap-8 p-0 md:sticky md:mx-auto md:max-w-[24rem] md:p-6 md:px-0 lg:top-[8rem] xl:top-[10rem]">
          <div className="grid gap-2">
            <h1 className="whitespace-normal text-4xl font-bold leading-10">
              {product.title}
            </h1>
            <span className="inherit text-copy max-w-prose whitespace-pre-wrap font-medium opacity-50">
              {product.vendor}
            </span>
          </div>
          <ProductOptions
            options={product.options}
            selectedVariant={selectedVariant}
          />
          {/* Delete this after verifying */}
          <p>Selected Variant: {product.selectedVariant?.id}</p>
          <Money
            withoutTrailingZeros
            data={selectedVariant.price}
            className="mb-2 text-xl font-semibold"
          />
          {orderable && (
            <div className="space-y-2">
              <ShopPayButton
                storeDomain={storeDomain}
                variantIds={[selectedVariant?.id]}
                width={'400px'}
              />
              <ProductForm variantId={selectedVariant?.id} />
            </div>
          )}
          <div
            className="prose text-md border-t border-gray-200 pt-6 text-black"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          ></div>
        </div>
      </div>
      <PrintJson data={product} />
    </section>
  );
}

function ProductGallery({media}: BadTypeObject) {
  if (!media.length) {
    return null;
  }

  const typeNameMap: BadTypeObject = {
    MODEL_3D: 'Model3d',
    VIDEO: 'Video',
    IMAGE: 'MediaImage',
    EXTERNAL_VIDEO: 'ExternalVideo',
  };

  return (
    <div
      className={`grid w-[90vw] grid-flow-col gap-4 overflow-x-scroll  md:w-full md:grid-flow-row md:grid-cols-2 md:overflow-x-auto md:p-0 lg:col-span-2`}
    >
      {media.map((med: BadTypeObject, i: number) => {
        let extraProps = {};

        if (med.mediaContentType === 'MODEL_3D') {
          extraProps = {
            interactionPromptThreshold: '0',
            ar: true,
            loading: 'eager',
            disableZoom: true,
            style: {height: '100%', margin: '0 auto'},
          };
        }

        const data: BadTypeObject = {
          ...med,
          __typename: typeNameMap[med.mediaContentType] || typeNameMap['IMAGE'],
          image: {
            ...med.image,
            altText: med.alt || 'Product image',
          },
        };

        return (
          <div
            className={`${
              i % 3 === 0 ? 'md:col-span-2' : 'md:col-span-1'
            } card-image aspect-square w-[80vw] snap-center rounded shadow-sm md:w-full`}
            key={data.id || data.image.id}
          >
            <MediaFile
              tabIndex={0}
              mediaOptions={{image: {height: 490, width: 595}}}
              className={`aspect-square h-full w-full object-cover`}
              data={data}
              {...extraProps}
            />
          </div>
        );
      })}
    </div>
  );
}

const PRODUCT_QUERY = `#graphql
  query product($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      media(first: 10) {
        nodes {
          ... on MediaImage {
            mediaContentType
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on Model3d {
            id
            mediaContentType
            sources {
              mimeType
              url
            }
          }
        }
      }
      options {
        name,
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        image {
          id
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
        sku
        title
        unitPrice {
          amount
          currencyCode
        }
        product {
          title
          handle
        }
      }
      variants(first: 1) {
        nodes {
          id
          title
          availableForSale
          price {
            currencyCode
            amount
          }
          compareAtPrice {
            currencyCode
            amount
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;
