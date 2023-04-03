import { PGChunk, PGEssay, PGJson } from "../types/index";
import axios from "axios";
import * as cheerio from "cheerio";
import { encode } from "gpt-3-encoder";
import fs from "fs";

const BASE_URL = "http://paulgraham.com";
const CHUNK_SIZE = 200;

const getLinks = async () => {
    const html = await axios.get(`${BASE_URL}/articles.html`);
    const $ = cheerio.load(html.data);

    const linksArr: { url: string; title: string }[] = [];

    const tables = $("table");
    tables.each((i, table) => {
        if (i === 2) {
            const links = $(table).find("a");
            links.each((j, link) => {
                const url = $(link).attr("href");
                const title = $(link).text();

                if (url && url.endsWith(".html")) {
                    const linkObj = {
                        url,
                        title,
                    };
                    linksArr.push(linkObj);
                }
            });
        }
    });

    return linksArr;
};

const getEssay = async (url: string, title: string) => {
    let essay: PGEssay = {
        title: "",
        url: "",
        date: "",
        content: "",
        tokens: 0,
        chunks: [],
    };
    const html = await axios.get(`${BASE_URL}/${url}`);
    const $ = cheerio.load(html.data);
    const tables = $("table");

    tables.each((i, table) => {
        if (i === 1) {
            const text = $(table).text();

            // Replaces one or more consecutive whitespace characters (spaces, tabs, or newlines) with a single space.
            // Also replaces a period followed by a letter (lowercase or uppercase) with a period, a space, and the same letter.
            // So "went to the market.Then..." becomes "went to the market. Then..." notice the space between "." and "Then"
            let cleanedText = text
                .replace(/\s+/g, " ")
                .replace(/\.([a-zA-Z])/g, ". $1");

            // Look for the date which is of the format "March 2023" (One capitalized letter,
            // followed by one or more small case letters, followed by space and 4 digits representing year)
            // The match() method returns an array containing the matched pattern and some additional information,
            // or null if no match is found.
            const split = cleanedText.match(/([A-Z][a-z]+ [0-9]{4})/);
            let dateStr = "";
            let textWithoutDate = "";

            if (split) {
                dateStr = split[0];
                textWithoutDate = cleanedText.replace(dateStr, "");
            }

            // replace newlines with space, then remove leading and trailing spaces from text
            let essayText = textWithoutDate.replace(/\n/g, " ").trim();

            essay = {
                title,
                url: `${BASE_URL}/${url}`,
                date: dateStr,
                content: essayText,
                tokens: encode(essayText).length,
                chunks: [],
            };
        }
    });

    return essay;
};

const getChunks = async (essay: PGEssay) => {
    const { title, url, date, content } = essay;
    let essayTextChunks: string[] = [];

    if (encode(content).length > CHUNK_SIZE) {
        const split = content.split(". ");
        let chunkText = "";

        for (let i = 0; i < split.length; i++) {
            const sentence = split[i];
            const sentenceTokenLength = encode(sentence).length;
            const chunkTextTokenLength = encode(chunkText).length;

            // ensure no chunk is over 200 tokens long
            if (chunkTextTokenLength + sentenceTokenLength > CHUNK_SIZE) {
                essayTextChunks.push(chunkText);
                chunkText = "";
            }

            // if the sentence ends with a letter or digit, add a period and space at the end.
            // Done to make sure there are no sentences that don't have an end tag like periods
            if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
                chunkText += sentence + ". ";
            } else {
                chunkText += sentence + " ";
            }
        }
        // push the last remaining chunk
        essayTextChunks.push(chunkText.trim());
    } else {
        essayTextChunks.push(content.trim());
    }

    const essayChunks: PGChunk[] = essayTextChunks.map((chunkText, i) => {
        const chunk = {
            essay_title: title,
            essay_url: url,
            essay_date: date,
            content: chunkText,
            content_tokens: encode(chunkText).length,
            embedding: [],
        };
        return chunk;
    });

    for (let i = 0; i < essayChunks.length; i++) {
        const essayChunk = essayChunks[i];
        const prevChunk = essayChunks[i - 1];

        if (essayChunk.content_tokens < 100 && prevChunk) {
            prevChunk.content += essayChunk.content;
            prevChunk.content_tokens += encode(essayChunk.content).length;
            essayChunks.splice(i, 1);
        }
    }

    const chunkedEssay: PGEssay = {
        ...essay,
        chunks: essayChunks,
    };

    return chunkedEssay;
};

(async () => {
    const links = await getLinks();

    let essays: PGEssay[] = [];
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const essay = await getEssay(link.url, link.title);
        const chunkedEssay = await getChunks(essay);
        essays.push(chunkedEssay);
    }

    const json: PGJson = {
        tokens: essays.reduce((acc, essay) => acc + essay.tokens, 0),
        essays,
    };

    fs.writeFileSync("scripts/pg.json", JSON.stringify(json));
})();
