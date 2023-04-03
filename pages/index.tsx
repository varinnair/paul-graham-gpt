import { PGChunk } from "@/types";
import endent from "endent";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [chunks, setChunks] = useState<PGChunk[]>([]);
    const [loading, setLoading] = useState(false);

    const handleAnswer = async () => {
        setLoading(true);
        setAnswer("");
        const searchResponse = await fetch("/api/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        if (!searchResponse.ok) {
            return;
        }

        const results: PGChunk[] = await searchResponse.json();
        setChunks(results);

        const prompt = endent`
        Use the following passages to answer the query: ${query}

        ${results.map((chunk) => chunk.content).join("\n\n")}
        `;

        const answerResponse = await fetch("/api/answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!answerResponse.ok) {
            return;
        }

        const data = answerResponse.body;

        if (!data) {
            return;
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            setAnswer((prev) => prev + chunkValue);
        }
        setLoading(false);
    };

    return (
        <>
            <Head>
                <title>Paul Graham GPT</title>
                <meta name="description" content="AI Q&A on PG's Essays" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        padding: "2%",
                        boxShadow: "0 0 10px #ccc",
                        width: "17%",
                        paddingTop: "0.25%",
                    }}
                >
                    <input
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            boxSizing: "border-box",
                            marginBottom: "10px",
                            marginTop: "10px",
                            borderRadius: "0px",
                        }}
                        type="text"
                        placeholder="Ask a question"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        style={{
                            width: "100%",
                            height: "40px",
                            border: "3px solid #ccc",
                            borderRadius: "0px",
                            backgroundColor: "dodgerblue",
                            color: "white",
                        }}
                        onClick={handleAnswer}
                    >
                        Search
                    </button>
                </div>
                <div
                    style={{
                        marginTop: "4px",
                        width: "50%",
                    }}
                >
                    {loading ? <span>Loading...</span> : <span>{answer}</span>}
                </div>
            </div>
        </>
    );
}
