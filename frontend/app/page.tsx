"use client";

import { useState } from "react";
import { Send, Loader2, Network } from "lucide-react";
import axios from "axios";
import GraphView from "../components/GraphView";

const API_BASE = "http://localhost:3000/api";

export default function Home() {
    const [transcript, setTranscript] = useState("");
    const [jobId, setJobId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setStatus("Submitting...");

        try {
            const response = await axios.post(`${API_BASE}/jobs`, { transcript });
            const data = response.data as { jobId: string };
            setJobId(data.jobId);
            pollJob(data.jobId);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit job");
            setLoading(false);
        }
    };

    const pollJob = async (id: string) => {
        setStatus("Processing...");
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${API_BASE}/jobs/${id}`);
                const data = response.data as { status: string; result?: any; error?: string };
                if (data.status === "done") {
                    setResult(data.result);
                    setLoading(false);
                    setStatus("Success!");
                    clearInterval(interval);
                } else if (data.status === "error") {
                    setError(data.error || "Processing failed");
                    setLoading(false);
                    clearInterval(interval);
                } else {
                    setStatus(`Status: ${data.status}...`);
                }
            } catch (err) {
                setError("Polling failed");
                clearInterval(interval);
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-4 text-white">
                        <Network className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        Odyssey Graph
                    </h1>
                    <p className="text-lg text-slate-600">
                        Convert meeting transcripts into visual task dependency networks.
                    </p>
                </header>

                <section className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste your meeting transcript here..."
                            className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none font-sans text-slate-700"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {status}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Extract Task Graph
                                </>
                            )}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                            Error: {error}
                        </div>
                    )}
                </section>

                {result && (
                    <section className="space-y-6">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">Visual Dependency Map</h2>
                            {result.warnings?.length > 0 && (
                                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                                    {result.warnings.length} Warnings
                                </span>
                            )}
                        </div>

                        <GraphView tasks={result.tasks} cycles={result.cycles} />

                        {result.warnings?.length > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <h3 className="text-sm font-bold text-amber-800 mb-2">Warnings</h3>
                                <ul className="list-disc list-inside text-xs text-amber-700 space-y-1">
                                    {result.warnings.map((w: string, i: number) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
