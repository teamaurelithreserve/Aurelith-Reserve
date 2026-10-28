import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Building,
  Check,
  Camera,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoEditModal } from './ProfilePhotoEditModal';
import { formatClientId } from '../../utils/clientIdFormatter';

interface ProfileSettingsViewProps {
  onNavigateSupport?: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = () => {
  const { user } = useBankingAuth();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  if (!user) return null;

  const isVerified = user.status === 'active';

  // Format member enrollment date
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : '2024';

  const displayedClientId = formatClientId(user.id, user.clientId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE PRIMARY PROFILE HEADER SUMMARY                               */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        {/* Top executive brand bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1C2B4C] via-[#C8102E] to-[#1C2B4C]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
          {/* Avatar Monogram & Primary Identity */}
          <div className="flex items-center space-x-5">
            {/* Clickable Profile Picture trigger */}
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="relative group rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1C2B4C] dark:focus:ring-slate-400 active:scale-95 transition-transform"
              title="Click to update profile photo"
              aria-label="Click to update profile photo"
            >
              <UserAvatar
                firstName={user.firstName}
                lastName={user.lastName}
                avatarUrl={user.avatarUrl}
                size="2xl"
                shape="rounded-2xl"
                className="border-2 border-white dark:border-[#152033] ring-4 ring-slate-100 dark:ring-slate-800 shadow-md group-hover:brightness-95 transition-all"
              />

              {/* Hover / tap camera badge overlay */}
              <div className="absolute inset-0 rounded-2xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                <Camera className="w-5 h-5 text-white drop-shadow-sm" />
                <span className="text-[9px] font-bold mt-0.5 tracking-tight">Edit</span>
              </div>

              {isVerified && (
                <div
                  title="Authoritative Verified Customer"
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white dark:border-[#152033] shadow-xs z-10"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1C2B4C] dark:text-white tracking-tight">
                  {user.firstName} {user.middleName ? `${user.middleName} ` : ''}{user.lastName}
                </h1>

                {isVerified ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Profile</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Pending Verification</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                Private Wealth &amp; Premier Banking Client
              </p>

              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                <span>
                  Client ID: <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{displayedClientId}</span>
                </span>
                <span>•</span>
                <span>Member Since: {memberSince}</span>
                <span>•</span>
                <span className="text-[#C8102E] font-semibold">Tier: Reserve Premier</span>
              </div>
            </div>
          </div>

          {/* Division Designation */}
          <div className="flex flex-col items-start sm:items-end space-y-1.5 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-[#10192A] rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              <Building className="w-3.5 h-3.5 text-[#1C2B4C] dark:text-blue-400" />
              <span>Aurelith Reserve • Dallas, TX</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Federal Reserve System Direct Member
            </span>
          </div>
        </div>
      </div>

      {/* Profile Photo Edit Modal */}
      <ProfilePhotoEditModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
      />
    </div>
  );
};
