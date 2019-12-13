'use strict'

const { journeys: validateArguments } = require('fpti-util').validateMethodArguments
const { DateTime } = require('luxon')
const { fetch } = require('fetch-ponyfill')()
const { stringify } = require('query-string')
const slugg = require('slugg')
const merge = require('lodash/merge')
const take = require('lodash/take')
const sortBy = require('lodash/sortBy')
const uniqBy = require('lodash/uniqBy')
const last = require('lodash/last')

// remove 00-padding from 9-digit (uic-)ids
const parseOutputId = id => {
	id = id + ''
	if (id.length === 9 && id.slice(0, 2) === '00') return id.slice(2)
	return id
}
// add 00-padding to 7-digit (uic-)ids
const formatInputId = id => {
	if (id.length === 7) return `00${id}`
	return id
}

// todo: timezones…
const createISODate = ({ day, time }) =>
	DateTime.fromFormat(`${day} ${time}`, 'yyyy-MM-dd HH:mm:ss', { zone: 'Europe/Berlin' }).toISO()

const createLocation = ({ longitude, latitude }) => ({
	type: 'location',
	longitude: +longitude,
	latitude: +latitude
})

const hashLeg = (l) => [l.origin.id, l.departure, l.destination.id, l.arrival, l.line ? l.line.id : '-'].join('_')
const hashJourney = (j) => j.legs.map(l => l.id).join('_')

const createLeg = l => {
	const leg = {
		origin: {
			type: 'station',
			id: parseOutputId(l.Origin.extId),
			name: l.Origin.name
		},
		destination: {
			type: 'station',
			id: parseOutputId(l.Destination.extId),
			name: l.Destination.name
		}
	}

	if (l.Origin.lon && l.Origin.lat) leg.origin.location = createLocation({ longitude: l.Origin.lon, latitude: l.Origin.lat })
	if (l.Destination.lon && l.Destination.lat) leg.destination.location = createLocation({ longitude: l.Destination.lon, latitude: l.Destination.lat })

	leg.departure = createISODate({ day: l.Origin.date, time: l.Origin.time })
	leg.arrival = createISODate({ day: l.Destination.date, time: l.Destination.time })

	if (leg.Product) leg.operator = leg.Product.operator + ''
	else leg.operator = 'interrail' // todo

	// todo: modes
	if (l.name.toLowerCase().includes('bus')) leg.mode = 'bus'
	else leg.mode = 'train'

	leg.public = true

	if (l.name) {
		leg.line = {
			type: 'line',
			id: slugg(l.name + ''),
			name: l.name + '',
			mode: leg.mode,
			public: leg.public
		}
	}

	leg.id = slugg(hashLeg(leg))
	return leg
}

const createJourney = j => {
	const journey = {
		type: 'journey',
		legs: j.LegList.Leg.map(createLeg)
	}
	journey.id = slugg(hashJourney(journey))
	return journey
}

// default options
const defaults = () => ({
	language: 'en',
	when: null,
	departureAfter: null,
	results: null,
	transfers: null,
	interval: null
})

const journeys = async (origin, destination, opt = {}) => {
	const def = defaults()
	if (!(opt.departureAfter || opt.when)) def.departureAfter = new Date()
	const options = merge({}, def, opt)
	validateArguments(origin, destination, options)
	if (typeof options.language !== 'string' || options.language.length !== 2) throw new Error('`opt.language` must be an ISO 639-1 language code')

	if (typeof origin !== 'string') origin = origin.id
	if (typeof destination !== 'string') destination = destination.id

	const date = options.when || options.departureAfter
	const endDate = DateTime.fromJSDate(date, { zone: 'Europe/Berlin' }).plus({ minutes: options.interval || 0 }).toJSDate()

	let arrivalsAfterEndDateFound = false
	let currentDate = date
	let journeys = []
	// eslint-disable-next-line no-labels
	fetchJourneys: do {
		const endpoint = 'https://api.eurail.com/timetable/trip'
		const query = stringify({
			lang: options.language,
			originId: formatInputId(origin),
			destId: formatInputId(destination),
			// todo: timezones…
			date: DateTime.fromJSDate(currentDate, { zone: 'Europe/Berlin' }).toFormat('yyyy-MM-dd'),
			time: DateTime.fromJSDate(currentDate, { zone: 'Europe/Berlin' }).toFormat('HH:mm')
		})
		const url = `${endpoint}?${query}`

		let results = await fetch(url)
		results = await results.json()

		// eslint-disable-next-line no-labels
		if (!results.Trip || results.Trip.length === 0) break fetchJourneys
		const newJourneys = sortBy(results.Trip.map(createJourney), journey => +new Date(journey.legs[0].departure))
		journeys.push(...newJourneys)

		const newCurrentDate = new Date(last(newJourneys).legs[0].departure)
		// eslint-disable-next-line no-labels
		if (+newCurrentDate === +currentDate) break fetchJourneys
		currentDate = newCurrentDate
		arrivalsAfterEndDateFound = +currentDate > +endDate
	} while (!arrivalsAfterEndDateFound)

	journeys = uniqBy(journeys, 'id')
	if (typeof options.interval === 'number') journeys = journeys.filter(j => +new Date(j.legs[0].departure) <= +endDate)
	if (typeof options.transfers === 'number') journeys = journeys.filter(j => j.legs.length <= options.transfers + 1)
	if (typeof options.results === 'number') journeys = take(journeys, options.results)
	return journeys
}
journeys.features = { // required by fpti
	results: 'Max. number of results returned',
	when: 'Journey date, synonym to departureAfter',
	departureAfter: 'List journeys with a departure (first leg) after this date',
	interval: 'Results for how many minutes after / before when (depending on whenRepresents)',
	transfers: 'Max. number of transfers',
	language: 'Language of the results, ISO 639-1 code'
}

module.exports = journeys
