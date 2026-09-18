import { create } from 'zustand';

interface JourneyState {
  activeTrainId: string | null;
  autoRefresh: boolean;
  followTrainMode: boolean;
  setActiveTrainId: (id: string | null) => void;
  toggleAutoRefresh: () => void;
  toggleFollowTrainMode: () => void;
  setFollowTrainMode: (val: boolean) => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeTrainId: null,
  autoRefresh: true,
  followTrainMode: true,
  setActiveTrainId: (id) => set({ activeTrainId: id }),
  toggleAutoRefresh: () => set((state) => ({ autoRefresh: !state.autoRefresh })),
  toggleFollowTrainMode: () =>
    set((state) => ({ followTrainMode: !state.followTrainMode })),
  setFollowTrainMode: (val) => set({ followTrainMode: val }),
}));
