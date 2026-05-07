export function digestEmailHtml({
  orgName,
  weekStart,
  traceCount,
  totalTokens,
  totalCostUsd,
  errorRate,
  topModels,
}: {
  orgName: string
  weekStart: string
  traceCount: number
  totalTokens: number
  totalCostUsd: number
  errorRate: number
  topModels: { model: string; count: number }[]
}) {
  const formatCost = (n: number) => n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(2)}`
  const formatNum = (n: number) => n.toLocaleString('en-US')

  const modelRows = topModels.slice(0, 5).map(m => `
    <tr>
      <td style="padding:8px 0;color:#a1a1aa;font-size:13px;font-family:monospace;">${m.model}</td>
      <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;">${formatNum(m.count)} calls</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#4DE5FC;width:32px;height:32px;border-radius:8px;text-align:center;vertical-align:middle;">
              <span style="color:#000;font-weight:900;font-size:16px;line-height:32px;">V</span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.5px;">Vantra</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding-bottom:6px;">
          <p style="margin:0;color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Weekly digest · ${weekStart}</p>
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${orgName}</h1>
        </td></tr>

        <!-- Stats grid -->
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:8px;">
            <tr>
              <td style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:18px 20px;width:33%;">
                <p style="margin:0 0 4px;color:#52525b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">Traces</p>
                <p style="margin:0;color:#fff;font-size:22px;font-weight:700;">${formatNum(traceCount)}</p>
              </td>
              <td style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:18px 20px;width:33%;">
                <p style="margin:0 0 4px;color:#52525b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">Tokens</p>
                <p style="margin:0;color:#fff;font-size:22px;font-weight:700;">${formatNum(totalTokens)}</p>
              </td>
              <td style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:18px 20px;width:33%;">
                <p style="margin:0 0 4px;color:#52525b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">Cost</p>
                <p style="margin:0;color:#4DE5FC;font-size:22px;font-weight:700;">${formatCost(totalCostUsd)}</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Error rate -->
        ${errorRate > 0 ? `
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid ${errorRate > 10 ? '#ef444433' : 'rgba(255,255,255,0.08)'};border-radius:10px;">
            <tr><td style="padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td><p style="margin:0;color:#71717a;font-size:13px;">Error rate this week</p></td>
                <td style="text-align:right;"><p style="margin:0;color:${errorRate > 10 ? '#f87171' : '#a1a1aa'};font-size:15px;font-weight:700;">${errorRate.toFixed(1)}%</p></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- Top models -->
        ${topModels.length > 0 ? `
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
            <tr><td style="padding:16px 20px 8px;">
              <p style="margin:0 0 12px;color:#52525b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">Top models</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${modelRows}
              </table>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- CTA -->
        <tr><td style="padding-bottom:36px;">
          <a href="https://vantra.dev/dashboard"
             style="display:inline-block;background:#4DE5FC;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;letter-spacing:-0.2px;">
            View dashboard →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
          <p style="margin:0;color:#3f3f46;font-size:12px;line-height:1.7;">
            Weekly digest from Vantra · every Monday.<br>
            <a href="https://vantra.dev/dashboard/settings" style="color:#52525b;text-decoration:underline;">Manage email preferences</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
