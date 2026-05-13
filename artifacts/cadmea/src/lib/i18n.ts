import { create } from "zustand";
import { persist } from "zustand/middleware";

interface I18nState {
  language: "en" | "lt";
  setLanguage: (lang: "en" | "lt") => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.map": "Map",
    "nav.districts": "Areas",
    "nav.compare": "Compare",
    "nav.tourist": "Places",
    "nav.wizard": "Decide",
    "hero.title": "Understand Cities Intelligently.",
    "hero.subtitle": "AI-powered urban intelligence platform for Lithuania.",
    "hero.cta.map": "Explore Map",
    "hero.cta.ai": "Ask AI",
    "hero.cta.compare": "Compare Districts",
  },
  lt: {
    "nav.map": "Žemėlapis",
    "nav.districts": "Vietovės",
    "nav.compare": "Palyginti",
    "nav.tourist": "Vietos",
    "nav.wizard": "Spręsti",
    "hero.title": "Supraskite miestus sumaniai.",
    "hero.subtitle": "Dirbtiniu intelektu paremta urbanistikos platforma Lietuvai.",
    "hero.cta.map": "Tyrinėti žemėlapį",
    "hero.cta.ai": "Klausti AI",
    "hero.cta.compare": "Palyginti rajonus",
  },
};

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => translations[get().language][key as keyof typeof translations["en"]] || key,
    }),
    {
      name: "cadmea-i18n",
    }
  )
);
