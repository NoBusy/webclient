import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';


let cachedTelegramId: number | null = null;

const getTelegramInitData = async (): Promise<string | null> => {
  try {
    const webApp = await getTgWebAppSdk();
    return webApp?.initData || null;
  } catch {
    return null;
  }
};

const getTelegramId = async (): Promise<number | null> => {
  if (cachedTelegramId !== null) {
    return cachedTelegramId;
  }

  try {
    const webApp = await getTgWebAppSdk();
    cachedTelegramId = webApp?.initDataUnsafe?.user?.id || null;
    return cachedTelegramId;
  } catch {
    return null;
  }
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL || "https://cryptoswapservertelegramm.fun/v1",
  credentials: 'include',
  prepareHeaders: async (headers) => {
    headers.set('Content-Type', 'application/json');

    const initData = await getTelegramInitData();
    if (initData) {
      headers.set('Authorization', `tma ${initData}`);
    }

    return headers;
  },
});

const baseQueryWithInterceptors: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const telegramId = await getTelegramId();
    if (telegramId) {
      const refreshResult = await baseQuery({
        url: `/users/profile`,
        method: 'GET',
        params: { telegram_id: telegramId }
      }, api, extraOptions);

      // Сохранение результата в кеше, чтобы избежать повторных запросов
      if (refreshResult.data) {
        result = await baseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithInterceptors,
  reducerPath: 'api',
  tagTypes: ['User', 'Workspace', 'Ticker', 'Chart', 'Quote', 'Stock', 'Event'],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({}),
});
