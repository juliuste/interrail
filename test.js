'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const { DateTime } = require('luxon')
const validate = require('validate-fptf')()
const fptiTests = require('fpti-tests')
const interrail = require('.')
const pkg = require('./package.json')

tape('interrail fpti tests', async t => {
	await t.doesNotReject(fptiTests.packageJson(pkg), 'valid package.json')
	t.doesNotThrow(() => fptiTests.packageExports(interrail, ['stations.search', 'journeys']), 'valid module exports')
	t.doesNotThrow(() => fptiTests.stationsSearchFeatures(interrail.stations.search.features, ['results']), 'valid stations.search features')
	t.doesNotThrow(() => fptiTests.journeysFeatures(interrail.journeys.features, ['when', 'departureAfter', 'results', 'interval', 'transfers']), 'valid journeys features')
	t.end()
})

tape('interrail.stations.search', async t => {
	const stations = await interrail.stations.search('Berlin')

	t.ok(stations.length > 5, 'number of stations')
	for (const station of stations) {
		validate(station)
		t.ok(station.id.slice(0, 2) === '80', 'id')
		t.ok(station.id.length === 7, 'id')
		t.ok(station.name.slice(0, 6).toLowerCase() === 'berlin', 'name')
		t.ok(station.weight >= 0, 'weight')
	}

	const fewStations = await interrail.stations.search('Berlin', { results: 1 })
	t.ok(fewStations.length === 1, 'number of stations')

	t.end()
})

tape('interrail.journeys', async t => {
	const berlin = '8065969'
	const ljubljana = {
		type: 'station',
		id: '7942300',
		name: 'Ljubljana'
	}
	const when = DateTime.fromJSDate(new Date(), { zone: 'Europe/Berlin' }).plus({ days: 10 }).startOf('day').plus({ hours: 5 }).toJSDate()
	const journeys = await interrail.journeys(berlin, ljubljana, { when })

	t.ok(journeys.length >= 2, 'number of journeys')
	for (const journey of journeys) {
		validate(journey)
		t.ok(journey.legs[0].origin.name.toLowerCase().includes('berlin'), 'origin')
		t.ok(journey.legs[journey.legs.length - 1].destination.name.toLowerCase().includes('ljubljana'), 'destination')
		t.ok(journey.legs.find(l => l.line), 'leg with line found')
		for (const leg of journey.legs) {
			if (leg.line) validate(leg.line)
		}
	}

	const directJourneys = await interrail.journeys(berlin, ljubljana, { when, transfers: 0 })
	t.ok(directJourneys.length === 0, 'number of direct journeys')

	const twoTransferJourneys = await interrail.journeys(berlin, ljubljana, { when, transfers: 2 })
	t.ok(twoTransferJourneys.length <= journeys.length, 'number of 1-transfer journeys')
	t.ok(twoTransferJourneys.length > 0, 'number of 1-transfer journeys')

	const fewJourneys = await interrail.journeys(berlin, ljubljana, { departureAfter: when, results: 2 })
	t.ok(fewJourneys.length === 2, 'number of journeys')

	const twoDaysLater = DateTime.fromJSDate(when).plus({ days: 2 }).toJSDate()
	const threeDays = 3 * 24 * 60
	const manyJourneys = await interrail.journeys(ljubljana, berlin, { when, interval: threeDays })
	t.ok(manyJourneys.length > 10, 'number of journeys')
	const journeysTwoDaysLater = manyJourneys.filter(j => +new Date(j.legs[0].departure) > +twoDaysLater)
	t.ok(journeysTwoDaysLater.length >= 2, 'number of journeys')

	t.end()
})
