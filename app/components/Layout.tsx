import {ReactNode} from 'react';

export function Layout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 antialiased">
      <header
        role="banner"
        className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-4 p-6 leading-none antialiased shadow-sm backdrop-blur-lg transition md:p-8 lg:p-12`}
      >
        <div className="flex gap-12">
          <a className="font-bold" href="/">
            {title}
          </a>
        </div>
      </header>

      <main
        role="main"
        id="mainContent"
        className="flex-grow p-6 md:p-8 lg:p-12"
      >
        {children}
      </main>
    </div>
  );
}
