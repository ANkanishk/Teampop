import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TournamentProvider, useTournaments } from './context/TournamentContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { TournamentsView } from './components/TournamentsView';
import { GameModesView } from './components/GameModesView';
import { ChampionshipView } from './components/ChampionshipView';
import { ResultsView } from './components/ResultsView';
import { RulesView } from './components/RulesView';
import { AdminPanelView } from './components/AdminPanelView';
import { ProfileView } from './components/ProfileView';
import { MyOrdersHistoryView } from './components/MyOrdersHistoryView';
import { GlobalLeaderboardView } from './components/GlobalLeaderboardView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RegistrationModal } from './components/RegistrationModal';
import { TrackMatchModal } from './components/TrackMatchModal';
import { LoginModal } from './components/LoginModal';
import { Match, GameModeId } from './types';
import { Trophy, ShieldCheck, Smartphone, Mail, Heart, Send, ExternalLink } from 'lucide-react';
import { soundFx } from './lib/soundEffects';

function updateMetaTag(propertyOrName: string, content: string, isNameAttr = false) {
  const selector = isNameAttr ? `meta[name="${propertyOrName}"]` : `meta[property="${propertyOrName}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (isNameAttr) {
      element.setAttribute('name', propertyOrName);
    } else {
      element.setAttribute('property', propertyOrName);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedMatchForReg, setSelectedMatchForReg] = useState<Match | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState<boolean>(false);
  const [trackInitialRegId, setTrackInitialRegId] = useState<string>('');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const { settings } = useTournaments();

  // Dynamic SEO Title & Open Graph Meta Updater
  useEffect(() => {
    const tabMeta: Record<string, { title: string; desc: string }> = {
      home: {
        title: 'POP Gaming Esports | Free Fire MAX Daily Tournaments & UPI Cash Bounties',
        desc: 'Join India’s verified Free Fire MAX esports tournaments. Compete in Solo, Duo, Squad, and 1v1 Clash Squad rooms with instant 15-minute UPI payouts.'
      },
      tournaments: {
        title: 'Daily Matches & Custom Rooms | POP Gaming Esports',
        desc: 'Browse active Free Fire MAX custom rooms. ₹20, ₹50, ₹100 entry fees with 2.0x Booyah placement prizes and guaranteed per-kill cash bounties.'
      },
      orders: {
        title: 'My Match Passes & Orders | POP Gaming Esports',
        desc: 'View active tournament entry passes, live unlocked room credentials, order transaction receipts, and bounty history.'
      },
      leaderboard: {
        title: 'Global Esports Hall of Fame & Top Fraggers | POP Gaming',
        desc: 'View top earners, daily MVPs, and clan rankings across Free Fire MAX Season 9 competitive tournaments.'
      },
      modes: {
        title: 'Battle Royale & 1v1 Lone Wolf Game Modes | POP Gaming',
        desc: 'Explore Free Fire tournament modes: BR Solo, Duo, Squad 4v4, Clash Squad Duels, Iron Cage & Snipers Only.'
      },
      championship: {
        title: 'Mega Monthly Championship & Grand Finals | POP Gaming',
        desc: 'Qualify for the Free Fire MAX Monthly Championship ₹10,000+ prize pool with streamed grand finals and MVP trophies.'
      },
      results: {
        title: 'Match Results & Official Scorecards | POP Gaming Esports',
        desc: 'View validated match scorecards, verified winner payouts, and live UTR transaction logs.'
      },
      rules: {
        title: 'Esports Rulebook & FAQ | POP Gaming Fair Play',
        desc: 'Complete guide to Free Fire tournament placement math, kill bounty rates, room ID unlock timings, and zero-tolerance anti-cheat policies.'
      },
      profile: {
        title: 'Player Profile & POP Wallet | POP Gaming Esports',
        desc: 'Manage your verified Game UID, track tournament history, and withdraw winning cash directly to your UPI ID.'
      },
      admin: {
        title: 'Admin Referee Control Panel | POP Gaming',
        desc: 'Referee dashboard for Free Fire tournament management, UTR validation, and room credential release.'
      }
    };

    const currentInfo = tabMeta[currentTab] || tabMeta.home;
    document.title = currentInfo.title;

    // Update Meta Description
    updateMetaTag('description', currentInfo.desc, true);
    // Update Open Graph tags for Facebook / WhatsApp preview
    updateMetaTag('og:title', currentInfo.title);
    updateMetaTag('og:description', currentInfo.desc);
    // Update Twitter card tags
    updateMetaTag('twitter:title', currentInfo.title, true);
    updateMetaTag('twitter:description', currentInfo.desc, true);
  }, [currentTab]);

  const handleSelectMatch = (match: Match) => {
    soundFx.playClick();
    setSelectedMatchForReg(match);
  };

  const handleSelectMode = (modeId: GameModeId) => {
    soundFx.playClick();
    setCurrentTab('tournaments');
  };

  const handleRegistrationSuccess = (regId: string) => {
    soundFx.playSuccess();
    setTrackInitialRegId(regId);
    setTrackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenTrackModal={() => {
          soundFx.playClick();
          setTrackInitialRegId('');
          setTrackModalOpen(true);
        }}
        onOpenLoginModal={() => {
          soundFx.playClick();
          setLoginModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 lg:pb-12">
        {currentTab === 'home' && (
          <HomeView
            onSelectMatch={handleSelectMatch}
            onSelectMode={handleSelectMode}
            onNavigateTab={setCurrentTab}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />
        )}

        {currentTab === 'tournaments' && (
          <TournamentsView onSelectMatch={handleSelectMatch} />
        )}

        {currentTab === 'orders' && (
          <MyOrdersHistoryView onOpenLoginModal={() => setLoginModalOpen(true)} />
        )}

        {currentTab === 'leaderboard' && (
          <GlobalLeaderboardView />
        )}

        {currentTab === 'modes' && (
          <GameModesView
            onSelectMode={handleSelectMode}
            onSelectMatch={handleSelectMatch}
          />
        )}

        {currentTab === 'championship' && (
          <ChampionshipView onSelectChampionshipMatch={handleSelectMatch} />
        )}

        {currentTab === 'results' && <ResultsView />}

        {currentTab === 'rules' && <RulesView />}

        {currentTab === 'admin' && <AdminPanelView />}

        {currentTab === 'profile' && <ProfileView onOpenLoginModal={() => setLoginModalOpen(true)} />}
      </main>

      {/* Mobile Sticky Bottom Dock Navigation */}
      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800/80 mt-auto pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-white">
                  POP<span className="text-orange-500">GAMING</span> ESPORTS
                </span>
              </div>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                India's verified Free Fire MAX daily esports tournament platform. Fairplay matches, transparent kill bounties, and direct instant UPI payouts.
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Fair Play Verified
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  Instant UPI Payouts
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-1.5 text-neutral-400">
                <li>
                  <button onClick={() => setCurrentTab('home')} className="hover:text-orange-400 cursor-pointer">
                    Home Lobby
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('tournaments')} className="hover:text-orange-400 cursor-pointer">
                    Daily Matches
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('orders')} className="hover:text-orange-400 cursor-pointer">
                    My Passes & Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('leaderboard')} className="hover:text-orange-400 cursor-pointer">
                    Esports Leaderboard
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('championship')} className="hover:text-orange-400 cursor-pointer">
                    Monthly Championship
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('rules')} className="hover:text-orange-400 cursor-pointer">
                    Rulebook & FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white uppercase tracking-wider">Support & Verification</h4>
                <p className="text-neutral-400 mt-1">Official Admin Email:</p>
                <p className="font-mono text-orange-400">{settings.supportEmail}</p>
                <p className="text-neutral-400 pt-1">WhatsApp Helpline:</p>
                <p className="font-mono text-emerald-400">{settings.supportWhatsApp}</p>
              </div>

              {settings.telegramUrl && (
                <div className="pt-2">
                  <a
                    id="footer-btn-telegram"
                    href={settings.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 font-bold transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Join Official Telegram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
            <p>© 2026 POP Gaming Esports Platform. All rights reserved.</p>
            <p>Skill-based esports tournaments compliant with fair play guidelines.</p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedMatchForReg && (
        <RegistrationModal
          match={selectedMatchForReg}
          onClose={() => setSelectedMatchForReg(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {trackModalOpen && (
        <TrackMatchModal
          initialRegId={trackInitialRegId}
          onClose={() => setTrackModalOpen(false)}
        />
      )}

      {loginModalOpen && (
        <LoginModal
          onClose={() => setLoginModalOpen(false)}
          onAdminAuthenticated={() => {
            setCurrentTab('admin');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TournamentProvider>
          <MainApp />
        </TournamentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

