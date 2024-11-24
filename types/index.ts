export type Chapter = {
    id: number;
    revelation_place: "makkah" | "madinah";
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: [number, number];
    translated_name: {
        language_name: "english";
        name: string;
    };
};

export type Verse = {
    id: number;
    chapter_id: number;
    verse_number: number;
    verse_key: string;
    verse_index: number;
    text_uthmani: string;
    text_uthmani_simple: string;
    text_imlaei: string;
    text_imlaei_simple: string;
    text_indopak: string;
    text_uthmani_tajweed: string;
    juz_number: number;
    hizb_number: number;
    rub_number: number;
    sajdah_type: string | null;
    sajdah_number: number | null;
    page_number: number;
    image_url: string;
    image_width: number;
    words: {
        id: number;
        position: number;
        audio_url: string;
        char_type_name: string;
        translation: {
            text: string;
            language_name: string;
        };
        transliteration: {
            text: string;
            language_name: string;
        };
    }[];
    audio: {
        url: string;
        segments: [number, number, number, number][];
    };
};

export type VerseResponse = {
    verses: Verse[];
    pagination: {
        per_page: number;
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_records: number;
    };
};

export interface Recitation {
    id: number;
    reciter_name: string;
    style: string;
    translated_name: {
        name: string;
        language_name: string;
    };
}

export interface RecitationsResponse {
    recitations: Recitation[];
}

export interface ChapterInfoResponse {
    chapter_info: {
        id: number;
        chapter_id: number;
        language_name: string;
        short_text: string;
        source: string;
        text: string;
    };
}

export interface AllahName {
    name: string;
    transliteration: string;
    meaning: string;
    meaningUrdu: string;
    descriptionUrdu: string;
}