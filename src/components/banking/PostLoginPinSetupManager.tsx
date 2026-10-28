import React, { useState, useEffect, useRef } from 'react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { TransactionPinSetupModal } from './TransactionPinSetupModal';

/**
 * PostLoginPinSetupManager
 *
 * Automatically displays a four-digit Transaction PIN setup pop-up after a consistent
 * 6-second delay once an authenticated, verified user without an existing PIN enters
 * the banking dashboard.
 */
export const PostLoginPinSetupManager: React.FC = () => {
  const { user, firebaseUser, refreshUser } = useBankingAuth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const scheduledUserIdRef = useRef<string | null>(null);
  const dismissedForSessionRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any active timer on dependency shift or unmount
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!user || !user.id) {
      scheduledUserIdRef.current = null;
      dismissedForSessionRef.current = false;
      setModalOpen(false);
      return;
    }

    // Reset session dismissal when a different user session is detected
    if (scheduledUserIdRef.current !== user.id) {
      scheduledUserIdRef.current = user.id;
      dismissedForSessionRef.current = false;
    }

    // Verify all four mandatory conditions:
    // 1. Account registration completed (user record with unique ID exists)
    // 2. Required account/email verification has been successfully completed
    const isEmailVerified =
      (user.emailVerified === true ||
        (user.emailVerified !== false && user.status !== 'pending_verification')) &&
      (!firebaseUser || firebaseUser.emailVerified !== false);

    // 3. User does not already have a transaction PIN configured
    const hasPin = Boolean(user.hasPaymentPin);

    // If conditions are not fulfilled or the prompt was dismissed in this session, do not schedule
    if (!isEmailVerified || hasPin || dismissedForSessionRef.current) {
      return;
    }

    // After successful login, wait a consistent delay of 6 seconds (6000ms)
    // before displaying the pop-up on the ready authenticated dashboard.
    timerRef.current = setTimeout(async () => {
      // Authoritative check before displaying the pop-up
      try {
        const latest = await refreshUser();
        if (latest?.hasPaymentPin) {
          return;
        }
      } catch {
        if (user.hasPaymentPin) {
          return;
        }
      }

      if (!dismissedForSessionRef.current) {
        setModalOpen(true);
      }
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    user?.id,
    user?.hasPaymentPin,
    user?.emailVerified,
    user?.status,
    firebaseUser?.emailVerified,
  ]);

  const handleClose = () => {
    dismissedForSessionRef.current = true;
    setModalOpen(false);
  };

  const handleSuccess = () => {
    setModalOpen(false);
  };

  if (!user || !modalOpen) return null;

  return (
    <TransactionPinSetupModal
      isOpen={modalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};
