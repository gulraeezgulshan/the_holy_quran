import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Recitation } from "../types";

interface StoreState {
    recitations: Recitation[];
    selectedRecitor: Recitation | null;
    setRecitations: (recitations: Recitation[]) => void;
    setSelectedRecitor: (recitor: Recitation) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            recitations: [],
            selectedRecitor: null,
            setRecitations: (recitations) => set({ recitations }),
            setSelectedRecitor: (recitor) => set({ selectedRecitor: recitor }),
        }),
        {
            name: 'quran-store',
        }
    )
);