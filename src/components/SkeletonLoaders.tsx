import React from 'react';

export const TournamentCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-neutral-800 rounded-full" />
        <div className="h-5 w-16 bg-neutral-800 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-neutral-800 rounded-lg" />
        <div className="h-4 w-1/2 bg-neutral-800/60 rounded-md" />
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800/60">
        <div className="space-y-1 text-center">
          <div className="h-3 w-12 bg-neutral-800 mx-auto rounded" />
          <div className="h-5 w-16 bg-neutral-800 mx-auto rounded" />
        </div>
        <div className="space-y-1 text-center border-x border-neutral-800/60">
          <div className="h-3 w-12 bg-neutral-800 mx-auto rounded" />
          <div className="h-5 w-16 bg-neutral-800 mx-auto rounded" />
        </div>
        <div className="space-y-1 text-center">
          <div className="h-3 w-12 bg-neutral-800 mx-auto rounded" />
          <div className="h-5 w-16 bg-neutral-800 mx-auto rounded" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-neutral-800 rounded" />
          <div className="h-3 w-12 bg-neutral-800 rounded" />
        </div>
        <div className="h-2 w-full bg-neutral-800 rounded-full" />
      </div>

      <div className="h-11 w-full bg-neutral-800 rounded-2xl mt-4" />
    </div>
  );
};

export const TournamentListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <TournamentCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const LeaderboardRowSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-neutral-800" />
        <div className="w-10 h-10 rounded-2xl bg-neutral-800" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-neutral-800 rounded" />
          <div className="h-3 w-20 bg-neutral-800/60 rounded" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-4 w-12 bg-neutral-800 rounded" />
        <div className="h-4 w-16 bg-neutral-800 rounded" />
        <div className="h-6 w-20 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
};

export const LeaderboardListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <LeaderboardRowSkeleton key={idx} />
      ))}
    </div>
  );
};
