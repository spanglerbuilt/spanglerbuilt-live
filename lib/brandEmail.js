// Shared branded email template for all SpanglerBuilt transactional emails.
// Usage: brandEmail({ preheader, title, subtitle, body })
// `body` is raw HTML string for the inner content section.

var BRAND = {
  name:    'SpanglerBuilt Inc.',
  orange:  '#D06830',
  dark:    '#111111',
  card:    '#161616',
  header:  '#0a0a0a',
  address: '44 Milton Ave, Alpharetta GA 30009',
  phone:   '(404) 492-7650',
  tel:     '4044927650',
  email:   'michael@spanglerbuilt.com',
  website: 'https://spanglerbuilt.com',
  portal:  'https://app.spanglerbuilt.com',
  logo:    'https://images.squarespace-cdn.com/content/v1/69358d7c8272151c17be540c/42548913-e9d5-4e72-aae3-1e9ababe163a/SB+logo_transparent%283%29.png',
  tagline1: 'We don\u2019t just build projects \u2014 we build lifestyles.',
  tagline2: 'Delivering precision, quality, and lasting value.',
  service_area: 'Licensed & Insured \u00b7 Fulton \u00b7 DeKalb \u00b7 Forsyth \u00b7 Cherokee \u00b7 Cobb \u00b7 North Georgia',
}

function brandEmail(opts) {
  var preheader  = opts.preheader  || ''
  var title      = opts.title      || 'SpanglerBuilt'
  var subtitle   = opts.subtitle   || ''
  var body       = opts.body       || ''
  var year       = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.dark};-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BRAND.dark};">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;border:1px solid #eeeeee;">

        <!-- ── LOGO HEADER (centered, black box) ── -->
        <tr><td style="background:#000000;padding:36px 36px 32px;text-align:center;">
          <img src="${BRAND.logo}" alt="SpanglerBuilt Inc." width="200" style="display:block;height:auto;max-width:200px;margin:0 auto;">
        </td></tr>

        <!-- ── TAGLINE UNDER LOGO ── -->
        <tr><td style="background:#000000;padding:0 36px 24px;text-align:center;border-top:1px solid rgba(255,255,255,.08);">
          <p style="margin:0 0 3px;font-size:12px;font-weight:600;color:rgba(255,255,255,.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.04em;">${BRAND.tagline1}</p>
          <p style="margin:0;font-size:11px;font-style:italic;color:rgba(255,255,255,.3);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${BRAND.tagline2}</p>
        </td></tr>

        <!-- ── ORANGE ACCENT BAR ── -->
        <tr><td style="background:${BRAND.orange};height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- ── BODY (white) ── -->
        <tr><td style="background:#ffffff;padding:36px 40px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${title ? `<p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-.02em;line-height:1.25;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${title}</p>` : ''}
          ${body}
        </td></tr>

        <!-- ── FOOTER (dark) ── -->
        <tr><td style="background:#0a0a0a;padding:24px 40px;">

          <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:0 0 16px;">

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,.35);line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  <strong style="color:rgba(255,255,255,.55);">${BRAND.name}</strong><br>
                  <span style="color:rgba(255,255,255,.3);">Design/Build Contractor &middot; GC &amp; Home Builder</span><br>
                  ${BRAND.address}<br>
                  <a href="tel:${BRAND.tel}" style="color:${BRAND.orange};text-decoration:none;">${BRAND.phone}</a>
                  &nbsp;&middot;&nbsp;
                  <a href="mailto:${BRAND.email}" style="color:${BRAND.orange};text-decoration:none;">${BRAND.email}</a>
                </p>
              </td>
              <td style="vertical-align:top;text-align:right;padding-left:16px;">
                <a href="${BRAND.portal}" style="display:inline-block;background:rgba(208,104,48,.15);border:1px solid rgba(208,104,48,.3);color:${BRAND.orange};font-size:11px;font-weight:700;padding:7px 14px;border-radius:4px;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Client Portal →</a>
              </td>
            </tr>
          </table>

          <p style="margin:14px 0 0;font-size:10px;color:rgba(255,255,255,.2);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            &copy; ${year} ${BRAND.name} &nbsp;&middot;&nbsp; ${BRAND.service_area}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

module.exports = { brandEmail, BRAND }
