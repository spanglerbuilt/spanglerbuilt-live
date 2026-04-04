// POST { projectId, projectName, startDate, phases }
// → downloads .ics file (iCalendar) with one VEVENT per phase

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var { projectName, startDate, phases } = req.body || {}
  if (!startDate || !phases || phases.length === 0) {
    return res.status(400).json({ error: 'startDate and phases required' })
  }

  var base    = new Date(startDate + 'T00:00:00')
  var name    = (projectName || 'SpanglerBuilt Project').replace(/[^\w\s\-\.]/g, '')
  var now     = icalStamp(new Date())
  var uid_base = 'spanglerbuilt-' + Date.now()

  function addDays(d, n) {
    var r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
  }

  function icalDate(d) {
    var y = d.getFullYear()
    var m = String(d.getMonth() + 1).padStart(2, '0')
    var dd = String(d.getDate()).padStart(2, '0')
    return y + '' + m + '' + dd
  }

  function icalStamp(d) {
    var y  = d.getFullYear()
    var mo = String(d.getMonth() + 1).padStart(2, '0')
    var dy = String(d.getDate()).padStart(2, '0')
    var h  = String(d.getHours()).padStart(2, '0')
    var mi = String(d.getMinutes()).padStart(2, '0')
    var s  = String(d.getSeconds()).padStart(2, '0')
    return y + '' + mo + '' + dy + 'T' + h + '' + mi + '' + s + 'Z'
  }

  var events = phases.map(function(p, i) {
    var sw  = parseInt(p.start_week) || 0
    var dw  = parseInt(p.duration_weeks) || 1
    var st  = addDays(base, sw * 7)
    var en  = addDays(base, (sw + dw) * 7)
    var uid = uid_base + '-' + i + '@spanglerbuilt.com'
    return [
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + now,
      'DTSTART;VALUE=DATE:' + icalDate(st),
      'DTEND;VALUE=DATE:' + icalDate(en),
      'SUMMARY:' + name + ' — ' + (p.phase || 'Phase ' + (i + 1)),
      'DESCRIPTION:Duration: ' + dw + ' week' + (dw !== 1 ? 's' : '') + '\\nSpanglerBuilt Inc. — (404) 492-7650',
      'LOCATION:SpanglerBuilt Inc.',
      'END:VEVENT',
    ].join('\r\n')
  })

  var ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SpanglerBuilt Inc.//Project Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + name,
    'X-WR-TIMEZONE:America/New_York',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="SpanglerBuilt_Schedule.ics"')
  res.send(ics)
}
