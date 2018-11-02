'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const moment = require('moment-timezone')
const validate = require('validate-fptf')()
const interrail = require('.')

tape('interrail.stations', async t => {
	const stations = await interrail.stations('Berlin')

	t.ok(stations.length > 5, 'number of stations')
	for (let station of stations) {
		validate(station)
		t.ok(station.id.slice(0, 2) === '80', 'id')
		t.ok(station.id.length === 7, 'id')
		t.ok(station.name.slice(0, 6).toLowerCase() === 'berlin', 'name')
		t.ok(station.weight >= 0, 'weight')
	}

	t.end()
})

tape('interrail.journeys', async t => {
	const berlin = '8065969'
	const ljubljana = {
		type: 'station',
		id: '7942300'
	}
	const when = moment.tz('Europe/Berlin').add(10, 'days').startOf('day').add(5, 'hours').toDate()
	const journeys = await interrail.journeys(berlin, ljubljana, { when })

	t.ok(journeys.length >= 2, 'number of journeys')
	for (let journey of journeys) {
		validate(journey)
		t.ok(journey.legs[0].origin.name.toLowerCase().includes('berlin'), 'origin')
		t.ok(journey.legs[journey.legs.length - 1].destination.name.toLowerCase().includes('ljubljana'), 'destination')
		for (let leg of journey.legs) {
			validate(leg.line)
		}
	}

	t.end()
})
