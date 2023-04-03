export type PGEssay = {
    title: string;
    url: string;
    date: string;
    content: string;
    tokens: number;
    chunks: PGChunk[];
};

export type PGChunk = {
    essay_title: string;
    essay_url: string;
    essay_date: string;
    content: string;
    content_tokens: number;
    embedding: number[];
};

export type PGJson = {
    tokens: number;
    essays: PGEssay[];
};
