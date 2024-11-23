import { RecitationsResponse, VerseResponse } from "../types";

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
    const response = await fetch(`${BASE_URL}/resources/recitations`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json() as Promise<RecitationsResponse>;
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