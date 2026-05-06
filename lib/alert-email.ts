export function alertEmailHtml({
  ruleName,
  metricLabel,
  windowMinutes,
  isTest = false,
}: {
  ruleName: string
  metricLabel: string
  windowMinutes: number
  isTest?: boolean
}) {
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

        ${isTest ? `
        <!-- Test badge -->
        <tr><td style="padding-bottom:16px;">
          <span style="background:#4DE5FC22;color:#4DE5FC;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:99px;border:1px solid #4DE5FC44;">
            Test notification
          </span>
        </td></tr>` : ''}

        <!-- Alert icon + title -->
        <tr><td style="padding-bottom:8px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#ef444422;width:36px;height:36px;border-radius:8px;border:1px solid #ef444444;text-align:center;vertical-align:middle;">
              <span style="color:#f87171;font-size:18px;line-height:36px;">!</span>
            </td>
            <td style="padding-left:12px;vertical-align:middle;">
              <span style="color:#71717a;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em;">Alert triggered</span>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding-bottom:6px;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${ruleName}</h1>
        </td></tr>

        <tr><td style="padding-bottom:28px;">
          <p style="margin:0;color:#71717a;font-size:14px;line-height:1.6;">
            ${isTest ? 'This is a test — no real threshold was breached.' : `A threshold was breached in the last ${windowMinutes} minutes.`}
          </p>
        </td></tr>

        <!-- Metric card -->
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 6px;color:#52525b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Current value</p>
              <p style="margin:0;color:#4DE5FC;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${metricLabel}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding-bottom:36px;">
          <a href="https://vantra.dev/dashboard/traces"
             style="display:inline-block;background:#4DE5FC;color:#000;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;letter-spacing:-0.2px;">
            View traces →
          </a>
        </td></tr>

        <!-- Divider -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
          <p style="margin:0;color:#3f3f46;font-size:12px;line-height:1.7;">
            You're receiving this because you configured an alert on Vantra.<br>
            <a href="https://vantra.dev/dashboard/alerts" style="color:#52525b;text-decoration:underline;">Manage alerts</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
