-- ============================================================
-- MIGRATION 006: Contract templates + project contract columns
-- Run in Supabase SQL editor
-- ============================================================

-- Contract templates table
CREATE TABLE IF NOT EXISTS contract_templates (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  project_type text NOT NULL,
  version      text DEFAULT '2.0',
  section_3_text text NOT NULL,
  is_active    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Project contracts table (one per project)
CREATE TABLE IF NOT EXISTS project_contracts (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  template_id     uuid REFERENCES contract_templates(id),
  project_type    text,
  status          text DEFAULT 'draft',  -- draft | sent | signed | voided
  contract_html   text,
  pdf_url         text,
  sent_at         timestamptz,
  signed_at       timestamptz,
  signer_1_name   text,
  signer_2_name   text,
  signer_1_ip     text,
  signer_2_ip     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Add project columns needed for contract auto-fill
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_1_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_2_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_address text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_city_state_zip text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimate_number text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimate_date text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration_weeks text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS commencement_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS permit_note text;

-- RLS: service_role only
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contracts  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_ct"  ON contract_templates  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_pc"  ON project_contracts   FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- SEED: 5 contract templates
-- ============================================================

INSERT INTO contract_templates (name, project_type, section_3_text) VALUES

-- BASEMENT
('Basement Renovation Contract', 'Basement',
'3. Unforeseen & Hidden Conditions — Basement Renovation

Basement renovations involve work within and adjacent to concealed structural, mechanical, and environmental systems. The following provisions reflect industry best practices and Georgia law to allocate risk fairly between the parties.

3a. Hidden & Concealed Conditions
Discovery Protocol: If Contractor discovers concealed conditions not visible at the time of estimate — including but not limited to: rotted framing, damaged subfloor, hidden water damage, obsolete or non-code-compliant wiring or plumbing, missing structural members, or deteriorated mechanicals — Contractor will stop affected work, notify Client in writing within 2 business days, and provide a written change order proposal. Client has 5 business days to approve or terminate.
Scope Limitation: This Contract covers only work visible and accessible at the time of estimate. Contractor is not responsible for conditions concealed behind existing walls, ceilings, floors, or structural elements not identifiable through reasonable pre-construction visual inspection.
Client Disclosure: Client represents and warrants that all known property conditions affecting the work have been disclosed, including prior water damage, drainage problems, foundation issues, pest damage, and known code violations.

3b. Water Intrusion, Drainage & Moisture
Pre-Existing Water Issues: Contractor is not responsible for pre-existing water intrusion, hydrostatic pressure, drainage failure, or moisture conditions.
Exterior Waterproofing: This Contract does not include exterior foundation waterproofing, French drain installation, or perimeter drainage systems unless expressly itemized in Exhibit A. Interior basement finishing does not constitute foundation waterproofing.
IRC R406 Compliance: Per Georgia adoption of the 2018 IRC, R406 requires damp proofing or waterproofing based on soil and water conditions. Any code-required measures discovered during construction will be addressed via written change order.
Post-Completion Moisture: Client is responsible for maintaining adequate ventilation, dehumidification, gutters, and site drainage after completion.

3c. Mold
Pre-Existing Mold: Contractor is not liable for pre-existing mold. If discovered, Contractor will stop work and notify Client. Professional licensed mold remediation may be required before work can resume.
Post-Completion Mold: Contractor is not liable for mold developing after completion due to Client failure to maintain ventilation, HVAC malfunction, plumbing leaks not caused by Contractor, or external water intrusion.

3d. Structural, Environmental & Hazardous Materials
Structural Conditions: If concealed structural deficiencies are discovered, engineering review may be required at Client expense before Contractor can proceed.
Hazardous Materials: If asbestos, lead paint, or regulated materials are encountered, Contractor will stop affected work. Licensed abatement is required at Client expense. Contractor cannot guarantee existing materials are free of hazardous substances.
Radon: Contractor does not test for or mitigate radon. Client is advised to test before and after basement finishing. Radon mitigation is outside the scope of this Contract.

GEORGIA RIGHT TO REPAIR ACT NOTICE (O.C.G.A. § 8-2-41(b)): GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.'),

-- KITCHEN
('Kitchen Remodel Contract', 'Kitchen',
'3. Unforeseen & Hidden Conditions — Kitchen Remodel

Kitchen remodels involve removal of existing cabinetry, flooring, and finishes that may conceal plumbing, electrical, structural, and environmental conditions not visible at the time of estimate.

3a. Hidden & Concealed Conditions
Discovery Protocol: If Contractor discovers concealed conditions upon demolition or during work — including but not limited to: non-code-compliant wiring or plumbing, water-damaged subfloor or sheathing, missing or undersized structural members, hidden rot or pest damage, or obsolete mechanical systems — Contractor will stop affected work, notify Client in writing within 2 business days, and provide a written change order. Client has 5 business days to approve or terminate.
Scope Limitation: Contract covers only work visible at time of estimate. Contractor is not responsible for conditions hidden behind cabinets, existing wall finishes, under flooring, or within wall cavities.
Client Disclosure: Client represents all known conditions have been disclosed, including prior plumbing leaks, water damage, pest damage, and known code violations.

3b. Water Damage & Subfloor Conditions
Pre-Existing Leaks: Contractor is not responsible for pre-existing plumbing leaks, water damage to framing or subfloor, or damage caused by prior appliance failures. Discovery of such conditions will trigger a written change order.
Subfloor Integrity: If existing subfloor is found to be damaged, rotted, or inadequate for new flooring installation, repair or replacement will be addressed via written change order at Client expense.
Appliance Connections: Contractor assumes existing plumbing supply and drain lines are functional and to code. Non-compliant or deteriorated lines discovered during work will require replacement at additional cost.

3c. Electrical & Plumbing Behind Walls
Existing Systems: Contractor assumes existing rough-in electrical and plumbing meet current code. If discovered to be non-compliant or inadequate to support the new kitchen layout, upgrades will be required via written change order.
Asbestos & Lead Paint: Homes built before 1980 may contain asbestos in flooring, drywall compound, or pipe insulation, and lead paint in wall or trim finishes. If encountered, licensed abatement is required at Client expense before Contractor can resume affected work.

3d. Structural Conditions
Load-Bearing Walls: Contractor will not remove or modify any wall without confirmation of its structural status. If walls are found to be load-bearing where not anticipated, structural engineering review and permits will be required at additional cost.
Hidden Framing Issues: Deteriorated, non-standard, or improperly modified framing discovered during demo will be addressed via written change order.

GEORGIA RIGHT TO REPAIR ACT NOTICE (O.C.G.A. § 8-2-41(b)): GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.'),

-- BATHROOM
('Bathroom Renovation Contract', 'Bathroom',
'3. Unforeseen & Hidden Conditions — Bathroom Renovation

Bathroom renovations frequently uncover pre-existing moisture damage, mold, subfloor deterioration, and plumbing deficiencies that were not visible or detectable prior to demolition.

3a. Hidden & Concealed Conditions
Discovery Protocol: If Contractor discovers concealed conditions upon demolition — including but not limited to: rotted subfloor or framing, failed shower pan or waterproofing membrane, hidden mold, non-code-compliant plumbing or wiring, or structural deficiencies — Contractor will stop affected work, notify Client in writing within 2 business days, and provide a written change order. Client has 5 business days to approve or terminate.
Scope Limitation: Contract covers only work visible and accessible at the time of estimate. Contractor is not responsible for conditions hidden behind tile, within wall cavities, under existing flooring, or within the plumbing chase.

3b. Moisture, Subfloor & Waterproofing
Subfloor Damage: Deterioration of the subfloor beneath existing tile or flooring — commonly caused by prior shower pan failures, grout failures, or plumbing leaks — is not included in the base contract price. Discovery will trigger a written change order.
Shower Pan & Waterproofing: Contractor assumes existing shower pan, liner, and wall waterproofing have failed or do not exist unless a pre-construction inspection confirms otherwise. New waterproofing per TCNA (Tile Council of North America) standards will be installed as part of all new wet area construction.
Pre-Existing Water Damage: Contractor is not responsible for water damage to adjacent areas, structure, or finishes caused by prior leaks or failed waterproofing predating this Contract.
Post-Completion Maintenance: Client is responsible for maintaining grout, caulk, and sealants in wet areas after project completion. Contractor warranty does not cover water intrusion resulting from Client failure to maintain these surfaces.

3c. Mold
Pre-Existing Mold: Contractor is not liable for pre-existing mold. If mold is discovered during demolition, Contractor will stop affected work and notify Client. Licensed mold remediation may be required at Client expense.
Mold Prevention: New wet area construction will include cement board or equivalent moisture-resistant backer, waterproofing membrane, and proper ventilation provisions per applicable code.

3d. Plumbing & Electrical
Existing Rough-In: Contractor assumes existing plumbing supply, drain, and vent lines are functional, properly sized, and to code. Non-compliant or deteriorated systems discovered during work will require repair or replacement via written change order.
GFCI Requirements: All electrical outlets within 6 feet of water sources will be GFCI-protected per current NEC code, regardless of existing conditions. Any additional electrical work required for code compliance will be addressed via change order.
Asbestos & Lead: Homes built before 1980 may contain asbestos tile or mastic and lead paint. If encountered, licensed abatement required at Client expense.

GEORGIA RIGHT TO REPAIR ACT NOTICE (O.C.G.A. § 8-2-41(b)): GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.'),

-- ADDITION
('Room Addition Contract', 'Addition',
'3. Unforeseen & Hidden Conditions — Room Addition

Room additions involve new construction tied into the existing structure and may expose concealed foundation conditions, structural deficiencies at the tie-in point, underground utilities, and soil conditions not determinable prior to commencement.

3a. Hidden & Concealed Conditions at Tie-In
Existing Structure Assessment: Contractor will inspect the tie-in point of the addition to the existing structure prior to commencement. If existing framing, foundation, or structural elements at the connection point are found to be deficient, deteriorated, or non-code-compliant, remediation will be addressed via written change order.
Discovery Protocol: If concealed conditions are discovered during construction — including damaged existing framing, inadequate existing foundation, non-code-compliant existing utilities, pest damage, or hazardous materials — Contractor will stop affected work, notify Client in writing within 2 business days, and provide a written change order. Client has 5 business days to approve or terminate.

3b. Subsurface & Soil Conditions
Soil & Subsurface: Contractor is not responsible for subsurface conditions including rock, ledge, unstable soil, high water table, buried debris, or underground utilities not identified prior to commencement. Discovery of such conditions will require a written change order for additional excavation, foundation modification, or engineering.
Underground Utilities: Client is responsible for locating and marking all underground utilities prior to excavation. Contractor will call 811 (Georgia 811 / Call Before You Dig) but Client acknowledges private utilities may not be marked by this service.
Georgia Soil: Clay-heavy North Georgia soils can expand and contract significantly with moisture changes. Foundation design will be reviewed by a licensed engineer if soil conditions warrant. Engineering fees are Client responsibility.

3c. Weather & Timeline
Weather Delays: Room additions involve extended periods of open structure exposed to weather. Delays due to rain, extreme temperatures, or severe weather events are Force Majeure events that extend the project timeline without constituting a breach of contract.
Structural Drying: Contractor will take reasonable precautions to protect open framing from precipitation. Client acknowledges that some moisture exposure is inherent in exterior construction and is not covered by the warranty if it results from normal weather events.

3d. Permits & Inspections
Permit Timeline: Room additions require building permits. Permit approval timelines are determined by the local building authority and are outside Contractor control. Project commencement date is contingent on permit issuance.
Inspection Hold Points: Work will be held at code-required inspection points. Delays caused by inspection scheduling are outside Contractor control and extend the project timeline accordingly.
Setback & Zoning: Client is responsible for confirming the proposed addition complies with local zoning setback requirements prior to permit application. If zoning approval or variance is required, those costs and timelines are Client responsibility.

3e. Structural & Hazardous Materials
Engineering: If structural calculations are required for the addition framing, beam sizing, or foundation design, engineering fees are Client responsibility and will be itemized via change order.
Asbestos & Lead Paint: Homes built before 1980 may contain asbestos siding, insulation, or roofing materials and lead paint that may be disturbed at the tie-in point. If encountered, licensed abatement required at Client expense.

GEORGIA RIGHT TO REPAIR ACT NOTICE (O.C.G.A. § 8-2-41(b)): GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.'),

-- NEW BUILD
('New Home Build Contract', 'New Build',
'3. Unforeseen Conditions — New Home Construction

New home construction involves ground-up building on a specific lot and may encounter subsurface, regulatory, utility, weather, and material conditions that are not determinable until construction is underway.

3a. Subsurface & Site Conditions
Soil Conditions: Contractor is not responsible for subsurface conditions including rock, ledge, expansive clay soils, high water table, underground debris, tree roots, or unstable fill material not identified in any pre-construction soils report. Discovery will require a written change order for additional excavation, foundation modification, or soil remediation.
Site Survey: Client is responsible for providing a current lot survey, establishing property lines, and confirming setback compliance prior to construction commencement. Contractor assumes Client-provided survey and plot plan are accurate.
Underground Utilities: Client is responsible for coordinating utility service connections. Contractor will call 811 prior to excavation. Contractor is not responsible for private utilities not marked by public locate services.
Grading & Drainage: Final site grading will slope away from the foundation per IRC R401.3. Contractor is not responsible for drainage issues caused by neighboring properties, municipal infrastructure, or lot conditions outside the contract scope.

3b. Weather & Construction Timeline
Weather Delays: New construction involves extended periods of exposed structure. Rain, freezing temperatures, extreme heat, and severe weather events are Force Majeure events that extend the project timeline without breach.
Material Drying Times: Concrete, masonry, and framing lumber require appropriate cure and drying time before subsequent work can proceed. These timelines are dictated by weather and material conditions and are not within Contractor control.
Material Availability: Supply chain delays, material shortages, and manufacturer lead times affecting project materials are outside Contractor control. Contractor will notify Client promptly of any material delays that affect the project schedule.

3c. Permits, Inspections & Regulatory
Permit Timeline: New construction requires building, electrical, mechanical, and plumbing permits. Permit issuance timelines are determined by local building authorities and are outside Contractor control.
Code Changes: If applicable building codes change between contract execution and permit issuance, Contractor will notify Client of any scope or cost impacts via written change order.
Inspection Hold Points: Construction will be held at all code-required inspection points. Delays caused by inspector scheduling or re-inspection requirements are outside Contractor control.
HOA & Covenants: Client is responsible for obtaining any HOA approvals and confirming compliance with deed restrictions and covenants. Contractor is not responsible for HOA-required modifications not identified prior to contract execution.

3d. Design & Engineering
Design Changes: Client-initiated design changes after permit application may require permit amendment and will be addressed via written change order including any associated fees and schedule impacts.
Structural Engineering: Structural engineering calculations required by the building official are included in the base contract price only if specifically itemized in Exhibit A. Additional engineering required due to site-specific conditions or code requirements will be addressed via change order.
Geotechnical Report: If a soils report or geotechnical investigation is required by the building official, those costs are Client responsibility.

3e. Hazardous Conditions
Site Contamination: Contractor is not responsible for pre-existing site contamination including soil contamination, underground storage tanks, or environmental conditions. Discovery requires Client to engage a licensed environmental consultant.

GEORGIA RIGHT TO REPAIR ACT NOTICE (O.C.G.A. § 8-2-41(b)): GEORGIA LAW CONTAINS IMPORTANT REQUIREMENTS YOU MUST FOLLOW BEFORE YOU MAY FILE A LAWSUIT OR OTHER ACTION FOR DEFECTIVE CONSTRUCTION AGAINST THE CONTRACTOR WHO CONSTRUCTED, IMPROVED, OR REPAIRED YOUR HOME. NINETY (90) DAYS BEFORE YOU FILE YOUR LAWSUIT OR OTHER ACTION, YOU MUST SERVE ON THE CONTRACTOR A WRITTEN NOTICE OF ANY CONSTRUCTION CONDITIONS YOU ALLEGE ARE DEFECTIVE. UNDER THE LAW, A CONTRACTOR HAS THE OPPORTUNITY TO MAKE AN OFFER TO REPAIR OR PAY FOR THE DEFECTS OR BOTH. YOU ARE NOT OBLIGATED TO ACCEPT ANY OFFER MADE BY A CONTRACTOR. THERE ARE STRICT DEADLINES AND PROCEDURES UNDER STATE LAW, AND FAILURE TO FOLLOW THEM MAY AFFECT YOUR ABILITY TO FILE A LAWSUIT OR OTHER ACTION.');
