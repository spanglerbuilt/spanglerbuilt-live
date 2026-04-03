// Shared HubSpot API helpers

var BASE = 'https://api.hubapi.com'

function headers() {
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY,
  }
}

// Find existing contact by email, or create one. Returns contactId.
async function upsertContact(params) {
  var email     = params.email
  var firstName = params.firstName
  var lastName  = params.lastName
  var phone     = params.phone || ''

  // Try to find existing contact
  var search = await fetch(BASE + '/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName:'email', operator:'EQ', value:email }] }],
      properties: ['email','firstname','lastname'],
      limit: 1,
    }),
  })
  var searchData = await search.json()
  if (searchData.results && searchData.results.length > 0) {
    return searchData.results[0].id
  }

  // Create new contact
  var create = await fetch(BASE + '/crm/v3/objects/contacts', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        email,
        firstname:   firstName,
        lastname:    lastName,
        phone:       phone,
        hs_lead_status: 'NEW',
      },
    }),
  })
  if (!create.ok) {
    var err = await create.json()
    throw new Error('HubSpot create contact failed: ' + JSON.stringify(err))
  }
  var contact = await create.json()
  return contact.id
}

// Create a deal and associate it with a contact. Returns dealId.
async function createDeal(params) {
  var projectNumber = params.projectNumber
  var projectType   = params.projectType
  var clientName    = params.clientName
  var budget        = params.budget || ''
  var contactId     = params.contactId

  var create = await fetch(BASE + '/crm/v3/objects/deals', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      properties: {
        dealname:  projectNumber + ' \u2014 ' + projectType + ' \u2014 ' + clientName,
        dealstage: 'appointmentscheduled',
        pipeline:  'default',
        amount:    budget ? budget.replace(/[^0-9.]/g, '') : '',
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    }),
  })
  if (!create.ok) {
    var err = await create.json()
    throw new Error('HubSpot create deal failed: ' + JSON.stringify(err))
  }
  var deal = await create.json()
  var dealId = deal.id

  // Associate contact → deal
  if (contactId) {
    await fetch(BASE + '/crm/v4/objects/deals/' + dealId + '/associations/default/contacts/' + contactId, {
      method: 'PUT',
      headers: headers(),
    })
  }

  return dealId
}

module.exports = { upsertContact, createDeal }
