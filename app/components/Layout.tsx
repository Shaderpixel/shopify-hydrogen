import {Await, useFetchers, useMatches} from '@remix-run/react';
import {ReactNode, Suspense, useEffect} from 'react';
import {BadTypeObject} from 'types';
import {CartActions, CartLineItems, CartSummary} from '~/components/Cart';
import {Drawer, useDrawer} from './Drawer';

function CartHeader({cart, openDrawer}: BadTypeObject) {
  // cart data is defer loaded in root.tsx hence use of Await
  return (
    <Suspense>
      <Await resolve={cart}>
        {(data) => (
          <button
            className="relative ml-auto flex h-8 w-8 items-center justify-center"
            onClick={openDrawer}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <title>Bag</title>
              <path
                fillRule="evenodd"
                d="M8.125 5a1.875 1.875 0 0 1 3.75 0v.375h-3.75V5Zm-1.25.375V5a3.125 3.125 0 1 1 6.25 0v.375h3.5V15A2.625 2.625 0 0 1 14 17.625H6A2.625 2.625 0 0 1 3.375 15V5.375h3.5ZM4.625 15V6.625h10.75V15c0 .76-.616 1.375-1.375 1.375H6c-.76 0-1.375-.616-1.375-1.375Z"
              ></path>
            </svg>
            {data?.totalQuantity > 0 && (
              <div className="text-contrast absolute bottom-1 right-1 flex h-3 w-auto min-w-[0.75rem] items-center justify-center rounded-full bg-red-500 px-[0.125rem] pb-px text-center text-[0.625rem] font-medium leading-none text-white subpixel-antialiased">
                <span>{data?.totalQuantity}</span>
              </div>
            )}
          </button>
        )}
      </Await>
    </Suspense>
  );
}

function CartDrawer({cart, close}: BadTypeObject) {
  const fetchers = useFetchers();

  return (
    <Suspense>
      <Await resolve={cart}>
        {(data) => {
          // can't do useMemo here for optimistic UI
          let removedCost = 0;
          // obtaining removed cost for optimistic UI purposes
          if (fetchers.length > 0) {
            removedCost = fetchers.reduce((acc, fetcher) => {
              if (
                fetcher.formAction === '/cart' &&
                fetcher.formData.get('cartAction') === 'REMOVE_FROM_CART'
              ) {
                const foundItem = data.lines.edges.find((edge: any) => {
                  return (
                    edge.node.id ===
                    JSON.parse(
                      (fetcher.formData.get('linesIds') as string) ?? '',
                    )[0]
                  );
                });
                acc += parseFloat(foundItem.node.cost.totalAmount.amount);
              }
              return acc;
            }, 0);
          } else {
            removedCost = 0;
          }

          return (
            <>
              {data?.totalQuantity > 0 ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center justify-between space-y-7 px-4 py-6 md:px-12 md:py-8">
                      <CartLineItems linesObj={data.lines} />
                    </div>
                  </div>
                  <div className="border-1 border-gray-00 w-full space-y-6 border px-4 py-6 md:px-12">
                    <CartSummary cost={data.cost} removedCost={removedCost} />
                    <CartActions checkoutUrl={data.checkoutUrl} />
                  </div>
                </>
              ) : (
                <div className="flex h-screen flex-col items-center justify-center space-y-7 px-4 py-6 md:px-12 md:py-8">
                  <h2 className="max-w-prose whitespace-pre-wrap text-4xl font-bold">
                    Your cart is empty
                  </h2>
                  <button
                    onClick={close}
                    className="inline-block w-full max-w-xl rounded-sm bg-black px-6 py-3 text-center font-medium leading-none text-white"
                  >
                    Continue shopping
                  </button>
                </div>
              )}
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}

export function Layout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const {isOpen, openDrawer, closeDrawer} = useDrawer();
  const [root] = useMatches(); // bring in the data from the root route
  const cart = root.data?.cart; // cart data loaded in the root route
  const fetchers = useFetchers();
  //   const addToCartFetchers = [];

  //   for (const fetcher of fetchers) {
  //     if (fetcher?.formData?.get('cartAction') === 'ADD_TO_CART') {
  //       addToCartFetchers.push(fetcher);
  //     }
  //   }

  // When the fetchers array changes, open the drawer if there is an add to cart action
  //   useEffect(() => {
  //     if (isOpen || addToCartFetchers.length === 0) return;
  //     openDrawer();
  //   }, [addToCartFetchers, isOpen, openDrawer]);

  // open cart drawer when adding product action is detected
  useEffect(() => {
    if (isOpen) return;
    if (fetchers.length > 0) {
      for (const fetcher of fetchers) {
        if (fetcher?.formData?.get('cartAction') === 'ADD_TO_CART') {
          openDrawer();
        }
      }
    }
  }, [fetchers, isOpen, openDrawer]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 antialiased">
      <header
        role="banner"
        className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-4 p-6 leading-none antialiased shadow-sm backdrop-blur-lg transition md:p-8 lg:p-12`}
      >
        <div className="flex w-full items-center gap-12">
          <a className="font-bold" href="/">
            {title}
          </a>
          <CartHeader cart={cart} openDrawer={openDrawer} />
        </div>
      </header>
      <main
        role="main"
        id="mainContent"
        className="flex-grow p-6 md:p-8 lg:p-12"
      >
        {children}
      </main>
      <Drawer open={isOpen} onClose={closeDrawer}>
        <CartDrawer cart={cart} close={closeDrawer} />
      </Drawer>
    </div>
  );
}
