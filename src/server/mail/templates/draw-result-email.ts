import { escapeHtml, formatCurrencyBRL, formatDateBR } from "@/lib/utils";

interface DrawResultEmailProps {
  giverName: string;
  receiverName: string;
  drawTitle: string;
  drawCode: string;
  eventDate: string | null;
  budget: number | null;
  appUrl: string;
}

export function drawResultEmail(props: DrawResultEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    giverName,
    receiverName,
    drawTitle,
    drawCode,
    eventDate,
    budget,
    appUrl,
  } = props;

  const safeGiver = escapeHtml(giverName);
  const safeReceiver = escapeHtml(receiverName);
  const safeTitle = escapeHtml(drawTitle);
  const safeCode = escapeHtml(drawCode);
  const safeAppUrl = escapeHtml(appUrl);

  const eventDateStr = eventDate ? formatDateBR(eventDate) : null;
  const budgetStr = budget ? formatCurrencyBRL(budget) : null;

  const subject = `🎁 ${safeGiver}, você tirou seu Amigo Secreto em "${safeTitle}"!`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:40px 32px;text-align:center;">
              <div style="font-size:48px;line-height:1;margin-bottom:12px;">🎄</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                Amigo Secreto
              </h1>
              <p style="margin:6px 0 0;color:#fecaca;font-size:14px;">${safeTitle}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;color:#64748b;font-size:14px;">Olá, <strong style="color:#0f172a;">${safeGiver}</strong>! 🎉</p>
              <p style="margin:0 0 28px;color:#334155;font-size:15px;line-height:1.6;">
                O sorteio foi realizado! Confira quem você vai presentear neste Amigo Secreto:
              </p>

              <!-- Receiver Card -->
              <div style="background:#fef2f2;border:2px dashed #fca5a5;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;color:#9f1239;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Você tirou</p>
                <p style="margin:0;color:#dc2626;font-size:32px;font-weight:800;letter-spacing:-0.5px;">
                  🎁 ${safeReceiver}
                </p>
              </div>

              <!-- Event Details -->
              ${
                eventDateStr || budgetStr
                  ? `<div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-bottom:28px;">
                <p style="margin:0 0 10px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhes do evento</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${
                    eventDateStr
                      ? `<tr>
                    <td style="color:#64748b;font-size:13px;padding:3px 0;">📅 Data do evento</td>
                    <td style="color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${eventDateStr}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    budgetStr
                      ? `<tr>
                    <td style="color:#64748b;font-size:13px;padding:3px 0;">💰 Valor sugerido</td>
                    <td style="color:#0f172a;font-size:13px;font-weight:600;text-align:right;">${budgetStr}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>`
                  : ""
              }

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${safeAppUrl}/draw/${safeCode}"
                   style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;">
                  Ver sorteio no app →
                </a>
              </div>

              <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.5;">
                Código do sorteio: <strong style="color:#64748b;">${safeCode}</strong><br/>
                Guarde o segredo! 🤫
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                Este e-mail foi enviado automaticamente pelo Secret Santa App.<br/>
                Não compartilhe com outros participantes do sorteio!
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `🎄 Amigo Secreto – ${safeTitle}

Olá, ${giverName}!

O sorteio foi realizado e você tirou: ${receiverName} 🎁

${eventDateStr ? `Data do evento: ${eventDateStr}\n` : ""}${budgetStr ? `Valor sugerido: ${budgetStr}\n` : ""}
Acesse o app para mais detalhes: ${appUrl}/draw/${drawCode}
Código do sorteio: ${drawCode}

Guarde o segredo! 🤫
`;

  return { subject, html, text };
}
