import { getIsGlobalLoading, getIsWindowCurrentlyOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { getSelectedWallet, getWallets, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';

export const useWalletsListWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast } = useToasts();

  const [getWalletRequest] = walletApi.useLazyGetWalletQuery();

  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isWindowOpen: boolean = useSelector(getIsWindowCurrentlyOpen)(GlobalWindow.WalletsList);
  const wallets: Wallet[] = useSelector(getWallets);

  const handleAddWallet = async (): Promise<void> => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.AddWallet }));
  };

  const handleWalletClick = async (wallet: Wallet): Promise<void> => {
    try {
      const result = await getWalletRequest(wallet.id).unwrap();
      dispatch(walletActions.setSelectedNetwork(wallet.network));
      result.ok && dispatch(globalActions.removeWindow(GlobalWindow.WalletsList));
    } catch (e) {
      errorToast('Failed to change wallet');
    }
  };

  const handleOpenWalletDetailsWindow = async (wallet: Wallet): Promise<void> => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.WalletDetails, payload: { wallet } }));
  };

  return {
    flow: {
      handleAddWallet,
      handleWalletClick,
      handleOpenWalletDetailsWindow,
    },
    state: {
      wallets,
      isLoading: isGlobalLoading,
      isWindowOpen,
      selectedWallet,
    },
  };
};
