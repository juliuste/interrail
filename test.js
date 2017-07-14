'use strict'

const tape = require('tape')
const interrail = require('./index')

tape('interrail.stations', (t) => {
	interrail.stations('Berlin').then((results) => {
		t.plan(9)
		t.false(results.length==0, 'results count')
		t.true(results[0].type === 'station', 'result type')
		t.true(results[0].id > 0, 'result id')
		t.true(results[0].name, 'result name')
		t.true(results[0].weight >= 0, 'result weight')
		t.true(results[0].products, 'result products')
		if(results[0].coordinates){
			t.true(results[0].coordinates.longitude, 'result coordinates longitude')
			t.true(results[0].coordinates.latitude, 'result coordinates latitude')
		}
		t.true(results[0].name == 'BERLIN (Germany)', 'result for `Berlin`')
	}).catch(console.error)
})


tape('interrail.journeys', (t) => {
	interrail.journeys(
		8065969, // Berlin
		7942300, // Ljubljana
		(new Date).toISOString()
	).then((results) => {
		t.plan(14)
		t.false(results.length==0, 'results count')
		t.true(results[0].type === 'journey', 'result type')
		t.true(results[0].legs, 'result legs')
		t.true(results[0].legs[0].origin.type === 'station', 'leg origin.type')
		t.true(results[0].legs[0].origin.name, 'leg origin.name')
		t.true(results[0].legs[0].origin.id, 'leg origin.id')
		t.true(results[0].legs[0].destination.type === 'station', 'leg destination.type')
		t.true(results[0].legs[0].destination.name, 'leg destination.name')
		t.true(results[0].legs[0].destination.id, 'leg destination.id')
		t.true(results[0].legs[0].departure, 'leg departure')
		t.true(results[0].legs[0].arrival, 'leg arrival')
		t.true(+new Date(results[0].legs[0].departure) < +new Date(results[0].legs[0].arrival), 'leg departure before arrival')
		t.true(results[0].legs[0].line, 'leg line')
		t.true(results[0].legs[results[0].legs.length - 1].destination.name == 'LJUBLJANA (Slovenia)', 'result for trip to `Ljubljana`')
	}).catch(console.error)
})
