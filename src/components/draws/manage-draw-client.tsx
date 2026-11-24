"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DrawRow, ParticipantRow } from "@/types/database";
import {
  addParticipantAction,
  deleteDrawAction,
  performDrawAction,
  removeParticipantAction,
  updateDrawAction,
} from "@/server/actions/draw-management";
import { formatCurrencyBRL, formatDateBR, toDatetimeLocalValue } from "@/lib/utils";
import { CopyCodeButton } from "./copy-code-button";
import { DrawStatusBadge } from "./draw-status-badge";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

interface ManageDrawClientProps {
  draw: DrawRow;
  participants: ParticipantRow[];
}

export function ManageDrawClient({
  draw,
  participants,
}: ManageDrawClientProps) {
  const router = useRouter();
  const isDraft = draw.status === "draft";

  // Estado edição de evento
  const [title, setTitle] = useState(draw.title);
  const [description, setDescription] = useState(draw.description || "");
  const [eventDate, setEventDate] = useState(
    toDatetimeLocalValue(draw.event_date)
  );
  const [budgetLimit, setBudgetLimit] = useState(
    draw.budget_limit !== null ? String(draw.budget_limit) : ""
  );
  const [isUpdating, startUpdate] = useTransition();
  const [updateMsg, setUpdateMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estado participantes
  const [partName, setPartName] = useState("");
  const [partEmail, setPartEmail] = useState("");
  const [isPartPending, startPartTransition] = useTransition();
  const [partError, setPartError] = useState<string | null>(null);

  // Estado sorteio / exclusão
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [isDrawing, startDrawTransition] = useTransition();
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawSuccessMsg, setDrawSuccessMsg] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleUpdateDraw = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);

    startUpdate(async () => {
      const res = await updateDrawAction({
        drawId: draw.id,
        title,
        description,
        eventDate,
        budgetLimit: budgetLimit || null,
      });

      if (res.success) {
        setUpdateMsg({
          type: "success",
          text: "Informações do evento atualizadas com sucesso!",
        });
        router.refresh();
      } else {
        setUpdateMsg({ type: "error", text: res.error });
      }
    });
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    setPartError(null);

    startPartTransition(async () => {
      const res = await addParticipantAction({
        drawId: draw.id,
        name: partName,
        email: partEmail,
      });

      if (res.success) {
        setPartName("");
        setPartEmail("");
        router.refresh();
      } else {
        setPartError(res.error);
      }
    });
  };

  const handleRemoveParticipant = (participantId: string) => {
    setPartError(null);
    startPartTransition(async () => {
      const res = await removeParticipantAction(draw.id, participantId);
      if (!res.success) {
        setPartError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const handlePerformDraw = () => {
    setDrawError(null);
    setDrawSuccessMsg(null);
    startDrawTransition(async () => {
      const res = await performDrawAction(draw.id);
      if (!res.success) {
        setDrawError(res.error);
        setConfirmDraw(false);
      } else {
        setConfirmDraw(false);
        setDrawSuccessMsg(
          `Sorteio realizado com sucesso entre ${res.count} participantes! Os pares foram gravados de forma sigilosa.`
        );
        router.refresh();
      }
    });
  };

  const handleDeleteDraw = () => {
    startDeleteTransition(async () => {
      const res = await deleteDrawAction(draw.id);
      if (!res.success) {
        setDrawError(res.error);
        setConfirmDelete(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Sorteio */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <DrawStatusBadge status={draw.status} />
              <CopyCodeButton code={draw.code} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {draw.title}
            </h1>
            <p className="text-sm text-slate-500">
              Evento: <strong className="text-slate-700">{formatDateBR(draw.event_date)}</strong>{" "}
              · Valor sugerido:{" "}
              <strong className="text-slate-700">
                {formatCurrencyBRL(draw.budget_limit)}
              </strong>
            </p>
          </div>

          {isDraft && (
            <div className="shrink-0">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Rascunho</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteDraw}
                    disabled={isDeleting}
                    className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Ação Principal: Realizar Sorteio ou Status Pós-Sorteio */}
      {isDraft ? (
        <section className="bg-gradient-to-br from-red-50 to-orange-50/60 rounded-2xl border border-red-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacidade Garantida</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Pronto para realizar o sorteio?
              </h2>
              <p className="text-sm text-slate-600">
                Ao sortear, os pares serão gerados e salvos de forma sigilosa no Supabase. Nem você (organizador) verá quem tirou quem. Recomendamos ao menos 3 participantes para garantir o mistério.
              </p>
            </div>

            <div className="shrink-0">
              {!confirmDraw ? (
                <button
                  type="button"
                  onClick={() => setConfirmDraw(true)}
                  disabled={participants.length < 2}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Realizar Sorteio ({participants.length})</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-xl border border-red-200 shadow-xs">
                  <span className="text-xs font-medium text-slate-700 px-1">
                    Confirmar disparo irreversível?
                  </span>
                  <button
                    type="button"
                    onClick={handlePerformDraw}
                    disabled={isDrawing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {isDrawing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sorteando...</span>
                      </>
                    ) : (
                      <span>Sim, Sortear Agora</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDraw(false)}
                    disabled={isDrawing}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {participants.length < 2 && (
            <p className="mt-3 text-xs font-medium text-red-700">
              Adicione pelo menos 2 participantes abaixo para habilitar o botão de sorteio.
            </p>
          )}

          {drawError && (
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-red-300 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{drawError}</span>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Sorteio Realizado com Sigilo!</span>
            </div>
            <p className="text-sm text-emerald-800/80">
              {drawSuccessMsg ||
                `Os pares entre os ${participants.length} participantes já foram gerados e protegidos no banco de dados.`}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-500 shrink-0">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Disparo via Nodemailer (Etapa 3)</span>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista e Gestão de Participantes */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span>Participantes ({participants.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDraft
                  ? "Adicione ou remova participantes antes de sortear."
                  : "Lista bloqueada após a realização do sorteio."}
              </p>
            </div>
            {!isDraft && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                <Lock className="w-3 h-3" />
                <span>Travado</span>
              </span>
            )}
          </div>

          {isDraft && (
            <form onSubmit={handleAddParticipant} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="Nome"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={partEmail}
                  onChange={(e) => setPartEmail(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isPartPending}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPartPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Adicionar Participante</span>
              </button>
            </form>
          )}

          {partError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{partError}</span>
            </div>
          )}

          {participants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Nenhum participante cadastrado ainda.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="px-4 py-3 flex items-center justify-between gap-2 text-sm bg-white hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                  </div>

                  {isDraft && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      disabled={isPartPending}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Remover participante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Edição de Detalhes do Evento */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 h-fit">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Configurações do Evento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atualize data, valor sugerido ou regras do encontro a qualquer momento.
            </p>
          </div>

          {updateMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                updateMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {updateMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{updateMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateDraw} className="space-y-4">
            <div>
              <label
                htmlFor="edit-title"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Título do Sorteio *
              </label>
              <input
                id="edit-title"
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-date"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Data e Hora do Evento
                </label>
                <input
                  id="edit-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-budget"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Valor Sugerido (R$)
                </label>
                <input
                  id="edit-budget"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ex: 100.00"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-desc"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Observações / Regras
              </label>
              <textarea
                id="edit-desc"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
