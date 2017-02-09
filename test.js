'use strict'

const tape = require('tape')
const interrail = require('./index')

tape('interrail.locations', (t) => {
	interrail.locations('Berlin').then((results) => {
		t.plan(8)
		t.false(results.length==0, 'results count')
		t.true(results[0].id > 0, 'result id')
		t.true(results[0].name, 'result name')
		t.true(results[0].weight >= 0, 'result weight')
		t.true(results[0].products, 'result products')
		if(results[0].coords){
			t.true(results[0].coords.lon, 'result coords lon')
			t.true(results[0].coords.lat, 'result coords lat')
		}
		t.true(results[0].name == 'BERLIN (Germany)', 'result for `Berlin`')
	}).catch(console.error)
})


tape('interrail.routes', (t) => {
	interrail.routes(
		8065969, // Berlin
		7942300, // Ljubljana
		(new Date).toISOString()
	).then((results) => {
		t.plan(11)
		t.false(results.length==0, 'results count')
		t.true(results[0].parts, 'result parts')
		t.true(results[0].parts[0].from.name, 'part from.name')
		t.true(results[0].parts[0].from.id, 'part from.id')
		t.true(results[0].parts[0].to.name, 'part to.name')
		t.true(results[0].parts[0].to.id, 'part to.id')
		t.true(results[0].parts[0].departure, 'part departure')
		t.true(results[0].parts[0].arrival, 'part arrival')
		t.true(+new Date(results[0].parts[0].departure) < +new Date(results[0].parts[0].arrival), 'part departure before arrival')
		t.true(results[0].parts[0].line, 'part line')
		t.true(results[0].parts[results[0].parts.length - 1].to.name == 'LJUBLJANA (Slovenia)', 'result for trip to `Ljubljana`')
	}).catch(console.error)
})