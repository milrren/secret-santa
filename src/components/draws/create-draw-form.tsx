"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDrawAction } from "@/server/actions/draw-management";
import { type DrawParticipantInput } from "@/server/schemas/draw";
import {
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

interface CreateDrawFormProps {
  userFullName: string;
  userEmail: string;
}

export function CreateDrawForm({
  userFullName,
  userEmail,
}: CreateDrawFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  const [participants, setParticipants] = useState<DrawParticipantInput[]>([]);
  const [partName, setPartName] = useState("");
  const [partEmail, setPartEmail] = useState("");
  const [partError, setPartError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedUserEmail = userEmail.trim().toLowerCase();
  const isCurrentUserIncluded = participants.some(
    (p) => p.email.toLowerCase() === normalizedUserEmail
  );

  const handleAddParticipant = () => {
    setPartError(null);
    const trimmedName = partName.trim();
    const trimmedEmail = partEmail.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setPartError("O nome do participante deve ter ao menos 2 caracteres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setPartError("Informe um e-mail válido.");
      return;
    }
    if (participants.some((p) => p.email.toLowerCase() === trimmedEmail)) {
      setPartError("Este e-mail já foi adicionado à lista.");
      return;
    }

    setParticipants((prev) => [
      ...prev,
      { name: trimmedName, email: trimmedEmail },
    ]);
    setPartName("");
    setPartEmail("");
  };

  const handleIncludeMe = () => {
    if (isCurrentUserIncluded) return;
    setPartError(null);
    setParticipants((prev) => [
      ...prev,
      { name: userFullName, email: normalizedUserEmail },
    ]);
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    setParticipants((prev) =>
      prev.filter((p) => p.email.toLowerCase() !== emailToRemove.toLowerCase())
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const response = await createDrawAction({
        title,
        description,
        eventDate,
        budgetLimit: budgetLimit || null,
        participants,
      });

      if (!response.success) {
        setFormError(response.error);
        return;
      }

      router.push(`/dashboard/draws/${response.drawId}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Dados do Evento */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            1. Informações do Evento
          </h2>
          <p className="text-sm text-slate-500">
            O código cupom exclusivo (ex: SANTA-XXXX) será gerado automaticamente ao salvar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nome do Sorteio *
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={3}
              maxLength={100}
              placeholder="Ex: Amigo Secreto da Firma 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="eventDate"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Data e Hora da Confraternização
            </label>
            <input
              id="eventDate"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="budgetLimit"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Valor Sugerido (R$)
            </label>
            <input
              id="budgetLimit"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ex: 100.00"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Regras ou Observações (Opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              placeholder="Ex: Local do encontro, horário de entrega dos presentes ou dicas gerais."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </section>

      {/* Participantes Iniciais */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              2. Participantes Iniciais ({participants.length})
            </h2>
            <p className="text-sm text-slate-500">
              Você também poderá adicionar ou remover pessoas antes de realizar o sorteio.
            </p>
          </div>
          <button
            type="button"
            onClick={handleIncludeMe}
            disabled={isCurrentUserIncluded}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isCurrentUserIncluded
                ? "Você já está na lista"
                : "Incluir-me como participante"}
            </span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nome do participante"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddParticipant();
              }
            }}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="email"
            placeholder="E-mail do participante"
            value={partEmail}
            onChange={(e) => setPartEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddParticipant();
              }
            }}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={handleAddParticipant}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {partError && (
          <p className="text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{partError}</span>
          </p>
        )}

        {participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-sm">
            <Users className="w-7 h-7 mx-auto mb-2 opacity-50" />
            <p>Nenhum participante adicionado ainda. Adicione acima ou salve como rascunho.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {participants.map((p) => (
              <li
                key={p.email}
                className="px-4 py-3 flex items-center justify-between text-sm bg-white hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className="text-slate-400 ml-2 text-xs">({p.email})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(p.email)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Remover participante"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Criando Sorteio...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Criar Sorteio e Gerar Código</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
