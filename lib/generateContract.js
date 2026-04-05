// lib/generateContract.js
// Builds the full contract HTML from project data + section_3_text from template.
// Used by pages/api/contracts/generate.js for Puppeteer PDF rendering.

function pad2(n) { return String(n).padStart(2, '0') }

function fmtDate(d) {
  if (!d) return '________________'
  var dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return String(d)
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
  return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear()
}

function fmtMoney(n) {
  if (!n && n !== 0) return '___________'
  return '$' + parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function blank(val, placeholder) {
  return val || (placeholder || '________________________________')
}

function nl2p(text) {
  if (!text) return ''
  return text.split(/\n\n+/).map(function(para) {
    return '<p>' + para.replace(/\n/g, '<br/>') + '</p>'
  }).join('\n')
}

module.exports = function generateContractHTML(project, section3Text) {
  var today          = new Date()
  var contractDate   = project.contract_date ? new Date(project.contract_date) : today
  var commDate       = project.commencement_date ? fmtDate(project.commencement_date) : '________________'
  var compDate       = project.completion_date   ? fmtDate(project.completion_date)   : '________________'
  var estDate        = project.estimate_date  || fmtDate(today)
  var estNum         = project.estimate_number || project.project_number || '____________'
  var durationWeeks  = project.duration_weeks || '____'
  var permitNote     = project.permit_note    || 'Subject to permit issuance timeline.'
  var contractValue  = fmtMoney(project.estimate_total)
  var projectType    = project.project_type   || 'Renovation'
  var projectAddr    = project.address || project.client_city_state_zip || '________________________________'
  var client1        = project.client_1_name  || project.client_name || '________________________________'
  var client2        = project.client_2_name  || ''
  var clientAddr     = project.client_address || projectAddr
  var clientCSZ      = project.client_city_state_zip || '________________________________'
  var projectNum     = project.project_number || project.id || '____________'
  var section3HTML   = nl2p(section3Text || '')

  // Payment schedule rows (6 milestones)
  var payRows = [
    { milestone: 'Deposit to Book',          pct: '10%' },
    { milestone: 'Project Mobilization',     pct: '25%' },
    { milestone: 'Rough-In Complete',        pct: '25%' },
    { milestone: 'Materials & Selections Set', pct: '25%' },
    { milestone: 'Substantial Completion',   pct: '10%' },
    { milestone: 'Final Walkthrough & Sign-Off', pct: '5%' },
  ].map(function(row) {
    return '<tr><td>' + row.milestone + '</td><td style="text-align:center">' + row.pct + '</td><td style="text-align:right">See Exhibit B</td></tr>'
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10.5pt;
    color: #111;
    line-height: 1.6;
    background: #fff;
  }
  .page-content {
    padding: 0;
  }
  h1 {
    font-size: 15pt;
    font-weight: bold;
    text-align: center;
    margin: 24px 0 6px;
    letter-spacing: .04em;
  }
  h2 {
    font-size: 11pt;
    font-weight: bold;
    margin: 18px 0 4px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: .04em;
  }
  h3 {
    font-size: 10.5pt;
    font-weight: bold;
    margin: 12px 0 3px;
  }
  p {
    margin: 6px 0;
  }
  .center { text-align: center; }
  .subtitle {
    text-align: center;
    font-size: 11pt;
    color: #444;
    margin-bottom: 6px;
  }
  .project-info {
    border: 1px solid #999;
    border-radius: 3px;
    padding: 12px 16px;
    margin: 16px 0;
    background: #fafafa;
  }
  .project-info table { width: 100%; border-collapse: collapse; }
  .project-info td {
    padding: 4px 8px;
    font-size: 10pt;
    vertical-align: top;
  }
  .project-info td:first-child {
    font-weight: bold;
    width: 180px;
    color: #333;
  }
  .section {
    margin: 14px 0;
  }
  .section p, .section li { font-size: 10pt; }
  .notice {
    border: 2px solid #333;
    padding: 10px 14px;
    margin: 14px 0;
    font-size: 9.5pt;
    background: #f5f5f5;
  }
  .notice-title {
    font-weight: bold;
    font-size: 10pt;
    text-transform: uppercase;
    letter-spacing: .04em;
    margin-bottom: 6px;
  }
  table.pay-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10pt;
  }
  table.pay-table th {
    background: #1a1a1a;
    color: #fff;
    padding: 6px 10px;
    font-weight: bold;
    text-align: left;
  }
  table.pay-table td {
    padding: 6px 10px;
    border-bottom: 1px solid #ddd;
  }
  table.pay-table tr:last-child td { border-bottom: none; }
  .sig-block {
    margin-top: 16px;
  }
  .sig-line {
    display: flex;
    gap: 32px;
    margin: 14px 0 0;
  }
  .sig-cell {
    flex: 1;
  }
  .sig-cell .label {
    font-size: 9pt;
    color: #555;
    margin-bottom: 4px;
  }
  .sig-cell .line {
    border-bottom: 1px solid #333;
    height: 28px;
    margin-bottom: 4px;
  }
  .sig-cell .sub-label {
    font-size: 8.5pt;
    color: #777;
  }
  .exhibit {
    margin-top: 20px;
    border-top: 2px solid #FF8C00;
    padding-top: 12px;
  }
  .exhibit h2 { border-color: #FF8C00; }
  .orange { color: #cc6600; }
  .small { font-size: 9pt; color: #555; }
  .right-to-repair {
    border: 2px solid #333;
    padding: 10px 14px;
    margin: 14px 0;
    font-size: 9pt;
    font-style: italic;
    background: #fffbe6;
  }
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 3px 0; }
  .warranty-list li { font-size: 10pt; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="page-content">

  <!-- COVER -->
  <h1>RESIDENTIAL CONSTRUCTION CONTRACT</h1>
  <p class="subtitle">${projectType} — SpanglerBuilt Inc.</p>
  <p class="center small">Contract No. ${projectNum} &nbsp;·&nbsp; Date: ${fmtDate(contractDate)}</p>

  <div class="project-info">
    <table>
      <tr><td>Project Type</td><td>${projectType}</td></tr>
      <tr><td>Client(s)</td><td>${client1}${client2 ? ' &amp; ' + client2 : ''}</td></tr>
      <tr><td>Property Address</td><td>${projectAddr}</td></tr>
      <tr><td>Estimate No.</td><td>${estNum}</td></tr>
      <tr><td>Estimate Date</td><td>${estDate}</td></tr>
      <tr><td>Contract Value</td><td><strong>${contractValue}</strong></td></tr>
      <tr><td>Est. Duration</td><td>${durationWeeks} weeks</td></tr>
      <tr><td>Est. Commencement</td><td>${commDate}</td></tr>
      <tr><td>Est. Completion</td><td>${compDate}</td></tr>
      <tr><td>Permit Note</td><td>${permitNote}</td></tr>
    </table>
  </div>

  <p>This Residential Construction Contract ("Contract") is entered into as of <strong>${fmtDate(contractDate)}</strong>, between:</p>

  <p><strong>CONTRACTOR:</strong> SpanglerBuilt Inc., a Georgia corporation, 44 Milton Ave, Alpharetta, GA 30009, (404) 492-7650, michael@spanglerbuilt.com, Contractor License No. GCCO007957.</p>

  <p><strong>CLIENT:</strong> ${client1}${client2 ? ' and ' + client2 : ''}, of ${clientAddr}, ${clientCSZ} ("Client").</p>

  <!-- SECTION 1 -->
  <div class="section">
    <h2>1. Scope of Work</h2>
    <p>Contractor agrees to perform the ${projectType} work described in Exhibit A (Scope of Work &amp; Specifications) attached hereto and incorporated herein by reference. All work will be performed in a good and workmanlike manner consistent with applicable industry standards and Georgia building codes.</p>
    <p>Work not expressly included in Exhibit A is excluded from this Contract. Any additions, deletions, or modifications to the scope of work must be documented in a written, signed Change Order executed by both parties.</p>
  </div>

  <!-- SECTION 2 -->
  <div class="section">
    <h2>2. Contract Price &amp; Payment Schedule</h2>
    <p>Client agrees to pay Contractor the total Contract price of <strong>${contractValue}</strong> according to the following draw schedule:</p>
    <table class="pay-table">
      <thead><tr><th>Milestone</th><th>% of Contract</th><th>Amount</th></tr></thead>
      <tbody>${payRows}</tbody>
    </table>
    <p>All payments are due within 5 business days of written invoice. Payments not received within 10 days of invoice are subject to a 1.5% per month (18% per annum) late charge. Contractor may suspend work upon 3 days written notice if any payment is more than 10 days past due.</p>
    <p>Payments by: Check payable to SpanglerBuilt Inc. · ACH bank transfer · Zelle to michael@spanglerbuilt.com.</p>
  </div>

  <!-- SECTION 3 — PROJECT TYPE SPECIFIC -->
  <div class="section">
    ${section3HTML}
  </div>

  <!-- SECTION 4 -->
  <div class="section">
    <h2>4. Change Orders</h2>
    <p>Any change to the scope of work, materials, schedule, or contract price requires a written Change Order signed by both parties before work proceeds. Change Orders will include: description of change, adjusted price (additional cost or credit), and schedule impact. Verbal authorizations are not binding. Client acknowledges that unforeseen conditions (as described in Section 3) may require Change Orders during construction.</p>
  </div>

  <!-- SECTION 5 -->
  <div class="section">
    <h2>5. Project Schedule &amp; Delays</h2>
    <p>Contractor will commence work approximately <strong>${commDate}</strong> and substantially complete work by approximately <strong>${compDate}</strong>, subject to:</p>
    <ul>
      <li>Permit issuance by applicable authorities</li>
      <li>Timely Client decisions and approvals (material selections, Change Orders)</li>
      <li>Weather events, acts of God, or Force Majeure conditions</li>
      <li>Supplier delays, material shortages, or subcontractor scheduling</li>
      <li>Client-requested changes that affect schedule</li>
    </ul>
    <p>These dates are estimates only and are not guaranteed. Time is not of the essence unless specifically stated in a written Change Order executed by both parties.</p>
    <p>${permitNote}</p>
  </div>

  <!-- SECTION 6 -->
  <div class="section">
    <h2>6. Client Responsibilities</h2>
    <p>Client agrees to:</p>
    <ul>
      <li>Provide Contractor with reasonable access to the property during normal working hours</li>
      <li>Make timely material selections (within 5 business days of request) to avoid schedule delays</li>
      <li>Maintain homeowner's insurance on the property throughout the project</li>
      <li>Secure and remove personal property from work areas prior to commencement</li>
      <li>Ensure pets are secured away from work areas</li>
      <li>Notify Contractor in writing of any known property conditions that may affect the work</li>
      <li>Make all payments on time per the draw schedule in Section 2</li>
    </ul>
  </div>

  <!-- SECTION 7 -->
  <div class="section">
    <h2>7. Permits &amp; Code Compliance</h2>
    <p>Contractor will obtain all required permits for the work described in Exhibit A. Permit fees are included in the Contract price unless otherwise noted. Client is responsible for providing access for inspections. If code-required work is discovered during construction that was not apparent at time of estimate, it will be addressed via written Change Order.</p>
    <p>All work will be performed in compliance with applicable Georgia state and local building codes in effect at the time of permit application.</p>
  </div>

  <!-- SECTION 8 -->
  <div class="section">
    <h2>8. Insurance &amp; Licensing</h2>
    <p>Contractor maintains General Liability insurance (minimum $1,000,000 per occurrence / $2,000,000 aggregate) and Workers' Compensation insurance as required by Georgia law. Certificates of insurance are available upon request. Contractor holds Georgia General Contractor License No. GCCO007957. All subcontractors engaged by Contractor are required to carry appropriate insurance and licensing.</p>
  </div>

  <!-- SECTION 9 -->
  <div class="section">
    <h2>9. Warranty</h2>
    <p>Contractor warrants all labor and materials against defects in workmanship for a period of <strong>one (1) year</strong> from the date of Substantial Completion, subject to the following:</p>
    <ul class="warranty-list">
      <li><strong>Included:</strong> Defects in Contractor's workmanship and materials installed by Contractor</li>
      <li><strong>Excluded:</strong> Normal wear and tear; Client-supplied materials; damage caused by Client misuse, neglect, or modification; water intrusion caused by Client failure to maintain caulk, grout, or sealants; acts of God</li>
      <li><strong>Manufacturer warranties:</strong> Pass-through warranties on products and materials are limited to their respective manufacturer terms</li>
    </ul>
    <p>Warranty claims must be submitted in writing within the warranty period. Contractor will respond within 10 business days.</p>
  </div>

  <!-- SECTION 10 -->
  <div class="section">
    <h2>10. Dispute Resolution</h2>
    <p>The parties agree to attempt good faith negotiation to resolve any dispute before pursuing formal remedies. If negotiation fails, disputes shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Construction Industry Arbitration Rules, with arbitration conducted in Cherokee County, Georgia. The prevailing party in any dispute is entitled to recover reasonable attorney's fees and costs.</p>
    <p class="small">Nothing in this section prevents either party from seeking emergency injunctive relief to prevent immediate harm.</p>
  </div>

  <!-- SECTION 11 -->
  <div class="section">
    <h2>11. Lien Waiver &amp; Title</h2>
    <p>Upon receipt of each progress payment, Contractor will provide a partial lien waiver for work covered by that payment. Upon receipt of final payment, Contractor will provide a final lien waiver covering all labor and materials. Title to materials installed in the property passes to Client upon full payment for those materials.</p>
    <p>Client acknowledges that subcontractors and suppliers may have lien rights under Georgia law (O.C.G.A. § 44-14-360 et seq.) until paid by Contractor.</p>
  </div>

  <!-- SECTION 12 -->
  <div class="section">
    <h2>12. General Provisions</h2>
    <ul>
      <li><strong>Entire Agreement:</strong> This Contract, including all Exhibits, constitutes the entire agreement between the parties and supersedes all prior oral or written communications.</li>
      <li><strong>Amendments:</strong> This Contract may only be amended by a written Change Order or written addendum signed by both parties.</li>
      <li><strong>Governing Law:</strong> This Contract is governed by the laws of the State of Georgia.</li>
      <li><strong>Severability:</strong> If any provision is found unenforceable, the remainder of the Contract remains in full force and effect.</li>
      <li><strong>Notices:</strong> All notices must be in writing and delivered by email (with read receipt) or certified mail to the addresses above.</li>
      <li><strong>Subcontractors:</strong> Contractor may use licensed subcontractors to perform portions of the work. Contractor remains responsible for the work of all subcontractors.</li>
      <li><strong>Cleanup:</strong> Contractor will maintain reasonable job site cleanliness and perform final cleanup upon Substantial Completion.</li>
      <li><strong>Photographs:</strong> Contractor may photograph the project for portfolio and marketing purposes unless Client objects in writing prior to commencement.</li>
    </ul>
  </div>

  <div class="notice">
    <div class="notice-title">Georgia Right to Repair Act Notice — O.C.G.A. § 8-2-41(b)</div>
    <p>GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.</p>
  </div>

  <!-- SIGNATURES -->
  <div class="section">
    <h2>Signatures</h2>
    <p>By signing below, the parties agree to the terms and conditions of this Contract.</p>

    <div class="sig-block">
      <div class="sig-line">
        <div class="sig-cell">
          <div class="label">Contractor — SpanglerBuilt Inc.</div>
          <div class="line"></div>
          <div class="sub-label">Michael Spangler, Owner &amp; Founder</div>
        </div>
        <div class="sig-cell">
          <div class="label">Date</div>
          <div class="line"></div>
          <div class="sub-label">&nbsp;</div>
        </div>
      </div>
      <div class="sig-line">
        <div class="sig-cell">
          <div class="label">Client — ${client1}</div>
          <div class="line"></div>
          <div class="sub-label">Print name: ____________________________</div>
        </div>
        <div class="sig-cell">
          <div class="label">Date</div>
          <div class="line"></div>
          <div class="sub-label">&nbsp;</div>
        </div>
      </div>
      ${client2 ? `<div class="sig-line">
        <div class="sig-cell">
          <div class="label">Client — ${client2}</div>
          <div class="line"></div>
          <div class="sub-label">Print name: ____________________________</div>
        </div>
        <div class="sig-cell">
          <div class="label">Date</div>
          <div class="line"></div>
          <div class="sub-label">&nbsp;</div>
        </div>
      </div>` : ''}
    </div>
  </div>

  <!-- EXHIBIT A -->
  <div class="exhibit">
    <h2>Exhibit A — Scope of Work &amp; Specifications</h2>
    <p>The detailed scope of work, specifications, and materials are as described in Estimate No. ${estNum} dated ${estDate}, which is attached hereto and incorporated into this Contract by reference.</p>
    <p>[Attach signed estimate / scope document]</p>
  </div>

  <!-- EXHIBIT B -->
  <div class="exhibit">
    <h2>Exhibit B — Payment Schedule (Dollar Amounts)</h2>
    <table class="pay-table">
      <thead><tr><th>Milestone</th><th>%</th><th>Amount Due</th></tr></thead>
      <tbody>
        <tr><td>Deposit to Book</td><td>10%</td><td>________________</td></tr>
        <tr><td>Project Mobilization</td><td>25%</td><td>________________</td></tr>
        <tr><td>Rough-In Complete</td><td>25%</td><td>________________</td></tr>
        <tr><td>Materials &amp; Selections Set</td><td>25%</td><td>________________</td></tr>
        <tr><td>Substantial Completion</td><td>10%</td><td>________________</td></tr>
        <tr><td>Final Walkthrough &amp; Sign-Off</td><td>5%</td><td>________________</td></tr>
        <tr><td><strong>TOTAL</strong></td><td><strong>100%</strong></td><td><strong>${contractValue}</strong></td></tr>
      </tbody>
    </table>
  </div>

  <!-- EXHIBIT C -->
  <div class="exhibit">
    <h2>Exhibit C — Selections &amp; Allowances</h2>
    <p>Material selections and allowances are documented in the SpanglerBuilt Client Portal selections tool. Client agrees to make all selections within 5 business days of request. Selections confirmed after this deadline may result in schedule delays and are not covered by the completion date estimate in Section 5.</p>
    <p>[Client selections document / portal export attached]</p>
  </div>

</div>
</body>
</html>`
}
