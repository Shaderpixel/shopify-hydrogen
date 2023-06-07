import {
  Link,
  useLocation,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import {BadTypeObject} from 'types';

export default function ProductOptions({
  options,
  selectedVariant,
}: BadTypeObject) {
  // pathname and search will be used to build option URLs
  const {pathname, search} = useLocation();
  const [currentSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const paramsWithDefaults = (() => {
    const defaultParams = new URLSearchParams(currentSearchParams);

    if (!selectedVariant) {
      return defaultParams;
    }

    // selected variant can come from variantBySelectedOptions or product.variants.nodes[0]
    // default params set this way doesn't appear as part of the urlSearchParams
    for (const {name, value} of selectedVariant.selectedOptions) {
      if (!currentSearchParams.has(name)) {
        defaultParams.set(name, value);
      }
    }

    return defaultParams;
  })(); // IIFE

  // Update the in-flight request data from the 'navigation' (if available)
  // to create an optimistic UI that selects a link before the request completes
  const searchParams = navigation.location
    ? new URLSearchParams(navigation.location.search)
    : paramsWithDefaults;

  return (
    <div className="mb-6 grid gap-4">
      {/* Each option will show a label and option value <Links> */}
      {options.map((option: BadTypeObject) => {
        if (!option.values.length) {
          return;
        }

        // get the currently selected option value
        const currentOptionVal = searchParams.get(option.name);

        return (
          <div
            key={option.name}
            className="mb-4 flex flex-col flex-wrap gap-y-2 last:mb-0"
          >
            <h3 className="text-lead min-w-[4rem] max-w-prose whitespace-pre-wrap font-bold">
              {option.name}
            </h3>

            <div className="flex flex-wrap items-baseline gap-4">
              {option.values.map((value: string) => {
                // Build a URLSearchParams object from the current search string
                const linkParams = new URLSearchParams(searchParams);
                const isSelected = currentOptionVal === value;

                // Set the option name and value, overwriting any existing values
                linkParams.set(option.name, value);

                return (
                  <Link
                    key={value}
                    to={`${pathname}?${linkParams.toString()}`}
                    preventScrollReset
                    replace
                    className={`cursor-pointer border-b-[1.5px] py-1 leading-none transition-all duration-200 ${
                      isSelected ? 'border-gray-500' : 'border-neutral-50'
                    }`}
                  >
                    {value}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
