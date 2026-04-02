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
  logo:    'https://spanglerbuilt.com/logo.png',
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

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.dark};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- ── LOGO HEADER (centered, dark box) ── -->
        <tr><td style="background:#000000;border-radius:8px 8px 0 0;padding:32px 36px 28px;text-align:center;">
          <img src="${BRAND.logo}" alt="SpanglerBuilt Inc." width="180" style="display:block;height:auto;max-width:180px;margin:0 auto;" onerror="this.style.display='none'">
          <p style="margin:14px 0 0;font-size:9px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:.2em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${BRAND.website.replace('https://','')}</p>
        </td></tr>

        <!-- ── TITLE BAR ── -->
        <tr><td style="background:${BRAND.header};border-top:3px solid ${BRAND.orange};padding:24px 36px 20px;">
          ${title ? `<p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.02em;line-height:1.25;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${title}</p>` : ''}
          ${subtitle ? `<p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,.45);line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${subtitle}</p>` : ''}
        </td></tr>

        <!-- ── BODY ── -->
        <tr><td style="background:${BRAND.card};padding:32px 36px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          ${body}
        </td></tr>

        <!-- ── FOOTER ── -->
        <tr><td style="background:${BRAND.header};border-top:1px solid rgba(255,255,255,.06);border-radius:0 0 8px 8px;padding:20px 36px 24px;">

          <!-- Taglines -->
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,.6);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${BRAND.tagline1}</p>
          <p style="margin:0 0 16px;font-size:11px;font-style:italic;color:rgba(255,255,255,.3);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${BRAND.tagline2}</p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:0 0 16px;">

          <!-- Contact row -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,.35);line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                  <strong style="color:rgba(255,255,255,.5);">${BRAND.name}</strong><br>
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
