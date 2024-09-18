import { getIsWindowCurrentlyOpen, getIsWindowOpen, getOpenedWindow, globalActions, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { getWallets, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

export const useWalletDetailsWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();

  const [deleteWalletRequest, deleteWalletResult] = walletApi.useDeleteWalletMutation();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const walletDetailsWindow: GlobalWindowType<GlobalWindow> | undefined = useSelector(getOpenedWindow)(GlobalWindow.WalletDetails);
  const isWindowCurrentlyOpen: boolean = useSelector(getIsWindowCurrentlyOpen)(GlobalWindow.WalletDetails);
  const isWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.WalletDetails);
  const openedWallet: Wallet | undefined = walletDetailsWindow?.payload?.wallet;
  const wallets: Wallet[] = useSelector(getWallets);

  const handleDeleteWallet = async (): Promise<void> => {
    try {
      if (!openedWallet || !wallets.length) return;
      setIsLoading(true);

      const result = await deleteWalletRequest({
        id: openedWallet.id,
      }).unwrap();

      if (result.ok) {
        successToast('Wallet deleted');
        getWalletsRequest();
        const wallet: Wallet | undefined = wallets.find((w) => w.id === openedWallet.id);
        wallet && dispatch(walletActions.setSelectedWallet(wallet));
        dispatch(globalActions.removeLastWindow());
      }
    } catch (e) {
      errorToast(`Failed to delete wallet`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flow: {
      handleDeleteWallet,
    },
    state: {
      wallets,
      isWindowOpen,
      openedWallet,
      isWindowCurrentlyOpen,
      isLoading: isLoading || deleteWalletResult.isLoading,
      isBtnActive: isWindowCurrentlyOpen && openedWallet?.can_deleted,
    },
  };
};
