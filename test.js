'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const interrail = require('.')

tape('interrail.stations', async t => {
	const stations = await interrail.stations('Berlin')
	t.false(stations.length === 0, 'stations count')
	t.true(stations[0].type === 'station', 'result type')
	t.true(stations[0].id > 0, 'result id')
	t.true(stations[0].name, 'result name')
	t.true(stations[0].weight >= 0, 'result weight')
	t.true(stations[0].products, 'result products')
	if (stations[0].coordinates) {
		t.true(stations[0].coordinates.longitude, 'result coordinates longitude')
		t.true(stations[0].coordinates.latitude, 'result coordinates latitude')
	}
	t.true(stations[0].name === 'BERLIN (Germany)', 'result for `Berlin`')
	t.end()
})

tape('interrail.journeys', async t => {
	const journeys = await interrail.journeys(
		8065969, // Berlin
		7942300, // Ljubljana
		(new Date()).toISOString()
	)
	t.false(journeys.length === 0, 'journeys count')
	t.true(journeys[0].type === 'journey', 'result type')
	t.true(journeys[0].legs, 'result legs')
	t.true(journeys[0].legs[0].origin.type === 'station', 'leg origin.type')
	t.true(journeys[0].legs[0].origin.name, 'leg origin.name')
	t.true(journeys[0].legs[0].origin.id, 'leg origin.id')
	t.true(journeys[0].legs[0].destination.type === 'station', 'leg destination.type')
	t.true(journeys[0].legs[0].destination.name, 'leg destination.name')
	t.true(journeys[0].legs[0].destination.id, 'leg destination.id')
	t.true(journeys[0].legs[0].departure, 'leg departure')
	t.true(journeys[0].legs[0].arrival, 'leg arrival')
	t.true(+new Date(journeys[0].legs[0].departure) < +new Date(journeys[0].legs[0].arrival), 'leg departure before arrival')
	t.true(journeys[0].legs[0].line, 'leg line')
	t.true(journeys[0].legs[journeys[0].legs.length - 1].destination.name === 'LJUBLJANA (Slovenia)', 'result for trip to `Ljubljana`')
	t.end()
})
