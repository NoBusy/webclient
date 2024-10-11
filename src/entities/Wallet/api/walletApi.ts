import { getSelectedNetwork } from '../model/selectors/walletSliceSelectors';
import { Network, Transaction, Wallet } from '../model/types/walletSchema';
import { StateSchema } from '@/shared/lib/providers/StoreProvider';
import { ApiResponse } from '@/shared/lib/types/apiResponse';
import { walletActions } from '../model/slices/walletSlice';
import { globalActions } from '@/entities/Global';
import * as types from './walletApiTypes';
import { api } from '@/shared/api/api';

export const walletApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWallet: build.query<ApiResponse<Wallet>, string>({
      query: (id) => ({
        url: `/wallets/wallet/${id}`,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled, getState }) => {
        try {
          dispatch(globalActions.setLoading(true));

          const result = await queryFulfilled;
          const network: Network | undefined = getSelectedNetwork(getState() as StateSchema);

          if (result?.data?.data) {
            dispatch(walletActions.setSelectedWallet(result.data.data));
            !network && dispatch(walletActions.setSelectedNetwork(result.data.data.network));
          }
        } finally {
          dispatch(globalActions.setLoading(false));
        }
      },
    }),
    getWallets: build.query<ApiResponse<Wallet[]>, void>({
      query: () => ({
        url: `/wallets/list`,
      }),
    }),
    transfer: build.mutation<ApiResponse<Transaction>, types.TransferParams>({
      query: (body) => ({
        url: `/wallets/transfer`,
        method: 'POST',
        body,
      }),
    }),
    createWallet: build.mutation<ApiResponse<Wallet>, types.CreateWalletParams>({
      query: (body) => ({
        url: `/wallets/create`,
        method: 'POST',
        body,
      }),
    }),
    importWallet: build.mutation<ApiResponse<Wallet>, types.ImportWalletParams>({
      query: (body) => ({
        url: `/wallets/import`,
        method: 'POST',
        body,
      }),
    }),
    deleteWallet: build.mutation<ApiResponse<null>, types.DeleteWalletParams>({
      query: (body) => ({
        url: `/wallets/delete`,
        method: 'DELETE',
        body,
      }),
    }),
    getTokenInfo: build.query<ApiResponse<types.GetTokenInfoResult>, types.GetTokenInfoParams>({
      query: (params) => ({
        url: `/wallets/token/info`,
        params,
      }),
    }),
    getTokenPrice: build.query<ApiResponse<types.GetTokenPriceResult>, types.GetTokenPriceParams>({
      query: (params) => ({
        url: `/wallets/token/price`,
        params,
      }),
    }),
    addWalletToken: build.mutation<ApiResponse<null>, types.AddWalletTokenParams>({
      query: (body) => ({
        url: `/wallets/token/add`,
        method: 'POST',
        body,
      }),
    }),

    deleteWalletToken: build.mutation<ApiResponse<null>, types.DeleteWalletTokenParams>({
      query: (body) => ({
        url: `/wallets/token/delete`,
        method: 'DELETE',
        body,
      }),
    }),

    getWalletTransactions: build.query<ApiResponse<Transaction[]>, types.GetWalletTransactionsParams>({
      query: (params) => ({
        url: `/wallets/transactions`,
        params,
      }),
    }),

    swap: build.mutation<ApiResponse<Transaction>, types.SwapParams>({
      query: (body) => ({
        url: `/wallets/swap`,
        method: 'POST',
        body,
      }),
    }),
    getTokenExtendedInfo: build.query<ApiResponse<types.GetTokenExtendedInfoResult>, types.GetTokenPriceParams>({
      query: (params) => ({
        url: `/wallets/token/extended-info`,
        params,
      }),
    }),
    estimateGas: build.mutation<ApiResponse<number>, types.SwapParams>({
      query: (body) => ({
        url: `/wallets/estimate-swap-fee`,
        method: 'POST',
        body,
      }),
    }),

    getHistoricalQuotes: build.query<ApiResponse<types.GetHistoricalQuotesResult>, types.GetHistoricalQuotesParams>({
      query: (params) => ({
        url: `/wallets/token/historical-quotes`,
        params,
      }),
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetWalletsQuery,
  useTransferMutation,
  useCreateWalletMutation,
  useImportWalletMutation,
  useDeleteWalletMutation,
  useGetTokenInfoQuery,
  useGetTokenPriceQuery,
  useAddWalletTokenMutation,
  useGetWalletTransactionsQuery,
  useSwapMutation,
  useLazyGetTokenPriceQuery,
  useGetTokenExtendedInfoQuery,
  useEstimateGasMutation,
  useGetHistoricalQuotesQuery,
  useLazyGetHistoricalQuotesQuery,
  useDeleteWalletTokenMutation,
} = walletApi;
