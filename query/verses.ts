import { RecitationsResponse, SingleVerseResponse, VerseResponse } from "../types";

const BASE_URL = "https://api.quran.com/api/v4";

export const fetchVersesByChapter = async (chapter: string, page: number = 1, recitorId?: number) => {
    const audioParam = recitorId ? `&audio=${recitorId}` : '&audio=1';
    const response = await fetch(
        `${BASE_URL}/verses/by_chapter/${chapter}?language=ur&words=true&fields=text_uthmani&per_page=10&page=${page}${audioParam}`,
        {
            headers: {
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json() as Promise<VerseResponse>;
};

export const fetchRecitations = async () => {
    try {
        const response = await fetch(`${BASE_URL}/resources/recitations`, {
            headers: {
                'Accept': 'application/json'
            },
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        //console.log("Raw API response:", data);

        if (!data || !data.recitations) {
            throw new Error('Invalid response format');
        }

        return data as RecitationsResponse;
    } catch (error) {
        console.error("Fetch recitations error:", error);
        throw error;
    }
};

export const fetchChapterAudio = async (chapterId: string, recitorId: string) => {
    const response = await fetch(
        `${BASE_URL}/chapter_recitations/${recitorId}/${chapterId}`,
        {
            headers: {
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};

export const getChapterInfo = async (chapterId: string, language: string = 'ur') => {
    const response = await fetch(
        `${BASE_URL}/chapters/${chapterId}/info?language=${language}`,
        {
            headers: {
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};

export const fetchRandomVerse = async () => {
    const response = await fetch(
        `${BASE_URL}/verses/random?language=ur&words=true&fields=text_uthmani`,
        {
            headers: {
                'Accept': 'application/json'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json() as Promise<SingleVerseResponse>;
};
