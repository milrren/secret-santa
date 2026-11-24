"use client";

import { useState, useTransition } from "react";
import { executeDrawAction } from "@/server/actions/draw-actions";
import { MatchResult, Participant } from "@/server/schemas/participant";
import { Gift, Sparkles, CheckCircle2, Server, ArrowRight, Plus, Trash2, Cpu } from "lucide-react";

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Alice Silva", email: "alice@exemplo.com" },
  { id: "2", name: "Bruno Souza", email: "bruno@exemplo.com" },
  { id: "3", name: "Carla Mendes", email: "carla@exemplo.com" },
  { id: "4", name: "Diego Ramos", email: "diego@exemplo.com" },
];

export default function HomePage() {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: nameInput.trim(),
      email: emailInput.trim(),
    };

    setParticipants((prev) => [...prev, newParticipant]);
    setNameInput("");
    setEmailInput("");
    setErrorMessage(null);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setMatches([]);
  };

  const handleRunDraw = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const response = await executeDrawAction(participants);
      if (response.success) {
        setMatches(response.matches);
      } else {
        setErrorMessage(response.error);
      }
    });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-4">
          <Gift className="w-4 h-4" />
          <span>Next.js 15 + Serverless Functions + Vercel Ready</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Secret Santa Architecture
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Projeto base estruturado para executar toda a lógica de negócio via Serverless Functions e Server Actions na Vercel com TypeScript, Tailwind CSS v4 e Zod.
        </p>
      </header>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Server Actions</h3>
          <p className="text-sm text-slate-600">
            Mutações RPC diretas executadas como serverless functions sem necessidade de endpoints REST manuais.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Route Handlers</h3>
          <p className="text-sm text-slate-600">
            Endpoints REST desacoplados em <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/health</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/draw</code>.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Zod & Domínio Puro</h3>
          <p className="text-sm text-slate-600">
            Validação estrita de schemas em tempo de execução e algoritmo de sorteio (Derangement) isolado em serviços.
          </p>
        </div>
      </div>

      {/* Interactive Demonstration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Teste Interativo de Server Action</h2>
            <p className="text-sm text-slate-500">Adicione participantes e execute o sorteio serverless ao vivo.</p>
          </div>
          <button
            onClick={handleRunDraw}
            disabled={isPending || participants.length < 2}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isPending ? "Sorteando no Servidor..." : "Sortear Amigo Secreto"}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Form and List */}
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Participantes ({participants.length})</h3>

            <form onSubmit={handleAddParticipant} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Nome"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>

            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
              {participants.map((p) => (
                <li key={p.id} className="p-3 flex items-center justify-between text-sm hover:bg-slate-50">
                  <div>
                    <span className="font-medium text-slate-800">{p.name}</span>
                    <span className="text-slate-400 ml-2 text-xs">({p.email})</span>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Results */}
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Resultado do Sorteio Serverless</h3>
            {matches.length === 0 ? (
              <div className="h-64 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-sm">
                <Gift className="w-8 h-8 mb-2 opacity-50" />
                <p>Clique em &quot;Sortear Amigo Secreto&quot; para acionar a Server Action no servidor.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-emerald-100 bg-emerald-50/40 p-2 space-y-1">
                {matches.map((match, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-emerald-100 shadow-xs flex items-center justify-between text-sm"
                  >
                    <div className="font-medium text-slate-800">{match.giver.name}</div>
                    <ArrowRight className="w-4 h-4 text-emerald-600 mx-2 shrink-0" />
                    <div className="font-semibold text-emerald-700">{match.receiver.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* API links */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500">
          <div>
            <span>Testar rotas Serverless:</span>{" "}
            <a href="/api/health" target="_blank" className="text-blue-600 hover:underline font-mono ml-1">
              /api/health
            </a>
          </div>
          <div>Vercel zero-config deploy ready</div>
        </div>
      </div>
    </main>
  );
}

