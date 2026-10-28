import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Landmark,
  PiggyBank,
  History,
  FileText,
  Bell,
  User,
  LogOut,
  Eye,
  EyeOff,
  Menu,
  X,
  HelpCircle,
  Shield,
  Sliders,
  Globe,
} from 'lucide-react';
import { useBankingAuth } from '../../context/BankingAuthContext';
import { bankingApi } from '../../services/bankingApi';
import { BrandLogo } from '../common/BrandLogo';
import { UserAvatar } from '../common/UserAvatar';

export type BankingTab =
  | 'home'
  | 'overview'
  | 'accounts'
  | 'transfers'
  | 'bills'
  | 'cards'
  | 'loans'
  | 'savings'
  | 'transactions'
  | 'statements'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'support';

interface BankingLayoutProps {
  currentTab: BankingTab;
  onSelectTab: (tab: BankingTab) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const BankingLayout: React.FC<BankingLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  children,
}) => {
  const { user, logout, showBalances, toggleShowBalances, refreshUser } = useBankingAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (!user) return null;

  const unreadNotifs = user.notifications ? user.notifications.filter((n) => !n.read) : [];

  const handleMarkAllRead = async () => {
    try {
      await bankingApi.markAllNotificationsRead();
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'overview', label: 'Account Overview', icon: Wallet },
    { id: 'transfers', label: 'Money Transfers', icon: ArrowLeftRight },
    { id: 'bills', label: 'Pay Bills & Airtime', icon: Receipt },
    { id: 'cards', label: 'Cards Management', icon: CreditCard },
    { id: 'loans', label: 'Loans & Financing', icon: Landmark },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'statements', label: 'Account Statements', icon: FileText },
    { id: 'notifications', label: 'Notification Center', icon: Bell, badge: unreadNotifs.length },
    { id: 'profile', label: 'Customer Profile', icon: User },
    { id: 'settings', label: 'Security & Settings', icon: Sliders },
    { id: 'support', label: 'Customer Support', icon: HelpCircle },
  ];

  const totalBalance = user.accounts.reduce((sum, a) => sum + a.balance, 0);

  const renderNotificationsDropdown = () => (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setNotifDropdownOpen(false)}
      />
      <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fadeIn text-xs text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            Notifications ({unreadNotifs.length} new)
          </span>
          {unreadNotifs.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#C8102E] dark:text-red-400 hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto space-y-2">
          {user.notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500">No notifications yet.</div>
          ) : (
            user.notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`p-2.5 rounded-xl transition-colors ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                    : 'bg-red-50/60 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 text-slate-900 dark:text-white font-medium'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-bold text-[#1C2B4C] dark:text-red-300">{n.title}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">{n.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 text-center">
          <button
            onClick={() => {
              onSelectTab('notifications');
              setNotifDropdownOpen(false);
            }}
            className="text-[#1C2B4C] dark:text-sky-400 font-bold text-xs hover:underline cursor-pointer"
          >
            View all in Notification Center &gt;
          </button>
        </div>
      </div>
    </>
  );

  const renderUserDropdown = () => (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setUserDropdownOpen(false)}
      />
      <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#152033] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn text-xs text-slate-800 dark:text-slate-100">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2.5">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={user.avatarUrl}
            size="md"
            shape="circle"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user.email}</div>
          </div>
        </div>
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              onSelectTab('profile');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Customer Profile</span>
          </button>
          <button
            onClick={() => {
              onSelectTab('settings');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Security &amp; Settings</span>
          </button>
          <button
            onClick={() => {
              onSelectTab('statements');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Account Statements</span>
          </button>
          <button
            onClick={() => {
              onSelectTab('support');
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer font-medium"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Help &amp; Support</span>
          </button>
        </div>
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              setUserDropdownOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2 cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B111E] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-red-100 selection:text-red-900 transition-colors duration-150">
      {/* MOBILE TOP CONTROLS FOR NON-HOME SCREENS */}
      {currentTab !== 'home' && (
        <div className="md:hidden flex items-center justify-between px-4 pt-3.5 pb-2 relative z-20 bg-white dark:bg-[#152033] border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <BrandLogo imgClassName="h-6 w-auto object-contain" />
            <span className="font-extrabold text-sm tracking-tight text-[#1C2B4C] dark:text-white">
              AURELITH
            </span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Notifications Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="w-9 h-9 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer relative active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#C8102E] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>
              {notifDropdownOpen && renderNotificationsDropdown()}
            </div>

            {/* User Profile Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all overflow-hidden"
                aria-label="User Profile"
              >
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size="md"
                  shape="circle"
                />
              </button>
              {userDropdownOpen && renderUserDropdown()}
            </div>
          </div>
        </div>
      )}

      {/* TOP DESKTOP HEADER (FOR NON-HOME SCREENS) */}
      {currentTab !== 'home' && (
        <header className="hidden md:block bg-white dark:bg-[#152033] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left: Brand */}
            <div
              onClick={() => onSelectTab('home')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <BrandLogo
                showText
                subtext="Digital Banking"
                imgClassName="h-7 w-auto object-contain"
                textClassName="font-extrabold text-xl tracking-tight text-[#1C2B4C] dark:text-white font-sans"
                subtextClassName="text-[8px] uppercase tracking-widest text-[#C8102E] dark:text-red-400 font-bold"
              />
            </div>

            {/* Center: Net Liquidity quick indicator (hidden on desktop profile page) */}
            {currentTab !== 'profile' && (
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#10192A] border border-slate-200/80 dark:border-slate-800 px-4 py-1.5 rounded-full transition-colors">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Liquidity:</span>
                <span className="text-sm font-extrabold text-[#1C2B4C] dark:text-white font-mono tabular-nums">
                  {showBalances ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
                </span>
                <button
                  onClick={toggleShowBalances}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
                  title={showBalances ? 'Hide balances' : 'Show balances'}
                >
                  {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Right: Notifications, Customer Avatar, Logout (Logout hidden on desktop profile page) */}
            <div className="flex items-center space-x-3 relative">
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8102E] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && renderNotificationsDropdown()}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 pl-1.5 pr-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <UserAvatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                    shape="circle"
                  />
                  <span className="text-xs font-bold text-[#1C2B4C] dark:text-slate-200 max-w-[120px] truncate">
                    {user.firstName} {user.lastName}
                  </span>
                </button>
                {userDropdownOpen && renderUserDropdown()}
              </div>

              {currentTab !== 'profile' && (
                <button
                  onClick={logout}
                  className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY: SIDEBAR + CONTENT AREA */}
      <div className={`flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${currentTab === 'home' ? 'pt-3 pb-8 md:pt-6 md:pb-8' : 'py-4 md:py-6'} gap-6 relative`}>
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          {/* Brand Wordmark in Sidebar for Home / All views */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-2.5 px-3 py-2 cursor-pointer group"
          >
            <BrandLogo
              showText
              subtext="Digital Banking"
              imgClassName="h-7 w-auto object-contain"
              textClassName="font-extrabold text-base tracking-tight text-[#1C2B4C] dark:text-white font-sans"
              subtextClassName="text-[8px] uppercase tracking-widest text-[#C8102E] dark:text-red-400 font-bold"
            />
          </div>

          {/* Main Nav Links Box */}
          <div className="bg-white dark:bg-[#152033] rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as BankingTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 bg-[#C8102E] text-white text-[10px] rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Support & Branch Help Widget */}
          <div className="bg-[#BCE0F5] dark:bg-[#10192A] text-[#1C2B4C] dark:text-slate-100 rounded-3xl p-5 border border-sky-200 dark:border-slate-800 text-xs space-y-3 transition-colors">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Shield className="w-4 h-4 text-[#C8102E] dark:text-red-400" />
              <span>Aurelith Concierge</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Direct banking assistance, wire inquiries, and wealth advisory available 24/7.
            </p>
            <div className="font-extrabold text-sm text-[#1C2B4C] dark:text-white">855-660-5862</div>
            <button
              onClick={() => onSelectTab('support')}
              className="w-full py-2 bg-[#1C2B4C] hover:bg-[#152033] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              Open Support Ticket
            </button>
          </div>
        </aside>

        {/* MOBILE SLIDE-OVER DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar content */}
            <div className="relative w-72 max-w-[80%] bg-white dark:bg-[#152033] h-full shadow-2xl flex flex-col justify-between p-4 overflow-y-auto border-r border-slate-200 dark:border-slate-800 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <BrandLogo imgClassName="h-6 w-auto object-contain" />
                    <span className="font-extrabold text-sm tracking-tight text-[#1C2B4C] dark:text-white">
                      AURELITH RESERVE
                    </span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id as BankingTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#1C2B4C] dark:bg-slate-800 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="px-2 py-0.5 bg-[#C8102E] text-white text-[10px] rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Public Website</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-[#C8102E] dark:text-red-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN MODULE CONTENT VIEWPORT */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#152033] border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg transition-colors">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-[#C8102E] dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab('transfers')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'transfers' ? 'text-[#C8102E] dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => onSelectTab('bills')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'bills' ? 'text-[#C8102E] dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Pay</span>
        </button>

        <button
          onClick={() => onSelectTab('cards')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
            currentTab === 'cards' ? 'text-[#C8102E] dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>Cards</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
};
