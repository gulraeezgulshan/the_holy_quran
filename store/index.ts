import { create } from "zustand";
import { Recitation } from "../types";

interface Store {
    recitations: Recitation[];
    selectedRecitor: Recitation | null;
    setRecitations: (recitations: Recitation[]) => void;
    setSelectedRecitor: (recitor: Recitation) => void;
}

export const useStore = create<Store>((set) => ({
    recitations: [],
    selectedRecitor: null,
    setRecitations: (recitations) => set({ recitations }),
    setSelectedRecitor: (recitor) => set({ selectedRecitor: recitor }),
}));