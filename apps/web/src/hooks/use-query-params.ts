import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useQueryParam<T>(
  paramKey: string,
  defaultValue?: T
): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getParam = () => {
    const value = searchParams.get(paramKey);
    if (value === null && defaultValue !== undefined) return defaultValue;
    return value as T;
  };

  const queryParamSetter = (value: T) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === null || value === '') {
      params.delete(paramKey);
    } else {
      params.set(paramKey, String(value));
    }

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    if (searchParams.get(paramKey) === null && defaultValue !== undefined) {
      queryParamSetter(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return [getParam(), queryParamSetter];
}

type QueryParams<T> = {
  [K in keyof T]: T[K];
};

export function useQueryParams<T extends Record<string, unknown>>(
  defaults: QueryParams<T>
) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract only relevant query params based on the provided default object
  const filteredParams = Object.keys(defaults).reduce((acc, key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      acc[key as keyof T] = value as T[keyof T];
    } else {
      acc[key as keyof T] = defaults[key as keyof T];
    }
    return acc;
  }, {} as Partial<T>) as QueryParams<T>;

  // Function to update only relevant query params
  const querySetter = (newValues: Partial<T>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Initialize missing defaults in the URL
  useEffect(() => {
    const missingDefaults: Partial<T> = {};
    Object.keys(defaults).forEach(key => {
      if (searchParams.get(key) === null && defaults[key] !== undefined) {
        missingDefaults[key as keyof T] = defaults[key as keyof T];
      }
    });

    if (Object.keys(missingDefaults).length > 0) {
      querySetter(missingDefaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults]);

  return [filteredParams, querySetter] as const;
}

/**
 * THE USAGE
 *  
const [queryParams, setQueryParams] = useQueryParams({
  location: 'all',
  job_type: 'all',
});
setQueryParams({
  location: 'all',
  job_type: 'all',
});


const [currentPage, setCurrentPage] = useQueryParam<number>('page', 1);
setCurrentPage(2);
 * 
 */
