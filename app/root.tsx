import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {Seo} from '@shopify/hydrogen';
import type {Shop} from '@shopify/hydrogen/storefront-api-types';
import {
  defer,
  type LinksFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {Layout} from 'app/components/Layout';
import {BadTypeObject} from 'types';
import favicon from '../public/favicon.svg';
import {CART_QUERY} from './queries/cart';

import styles from './styles/app.css';
import tailwind from './styles/tailwind-build.css';

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: tailwind},
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

async function getCart({storefront}: BadTypeObject, cartId: string) {
  if (!storefront) {
    throw new Error('missing storefront client in cart query');
  }

  const {cart} = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}

export async function loader({context, request}: LoaderArgs) {
  const cartId = await context.session.get('cartId');

  // The defer function can be used to load data asynchronously. It returns a promise that resolves to the data that you pass to it.
  //In the code block below, layout is loaded synchronously with await, and cart is loaded asynchronously.
  return defer({
    cart: cartId ? getCart(context, cartId) : undefined,
    layout: await context.storefront.query<{shop: Shop}>(LAYOUT_QUERY),
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  const {name} = data.layout.shop;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
        <Links />
      </head>
      <body>
        <Layout title={name}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;
