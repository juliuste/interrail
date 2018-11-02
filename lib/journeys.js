'use strict'

const moment = require('moment-timezone')
const { fetch } = require('fetch-ponyfill')()
const { stringify } = require('query-string')
const slugg = require('slugg')
const isString = require('lodash/isString')
const isDate = require('lodash/isDate')
const merge = require('lodash/merge')

// default options
const defaults = () => ({
	when: new Date(),
	language: 'en'
})

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

const createLocation = ({ longitude, latitude }) => ({
	type: 'location',
	longitude: +longitude,
	latitude: +latitude
})

const hashLeg = (l) => [l.origin.id, l.departure, l.destination.id, l.arrival, l.line.id].join('_')
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

	// todo: timezones…
	leg.departure = moment.tz(l.Origin.date + '_' + l.Origin.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()
	leg.arrival = moment.tz(l.Destination.date + '_' + l.Destination.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()

	if (leg.Product) leg.operator = leg.Product.operator + ''
	else leg.operator = 'interrail' // todo

	// todo: modes
	if (l.name.toLowerCase().includes('bus')) leg.mode = 'bus'
	else leg.mode = 'train'

	leg.public = true

	leg.line = {
		type: 'line',
		id: slugg(l.name + ''),
		name: l.name + '',
		mode: leg.mode,
		public: leg.public
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

const journeys = async (origin, destination, opt = {}) => {
	if (isString(origin)) origin = { id: origin, type: 'station' }
	if (!isString(origin.id)) throw new Error('invalid or missing origin id')
	if (origin.type !== 'station') throw new Error('invalid or missing origin type')
	origin = origin.id

	if (isString(destination)) destination = { id: destination, type: 'station' }
	if (!isString(destination.id)) throw new Error('invalid or missing destination id')
	if (destination.type !== 'station') throw new Error('invalid or missing destination type')
	destination = destination.id

	const options = merge({}, defaults(), opt)
	if (!isDate(options.when)) throw new Error('`opt.when` must be a JS Date() object')
	if (!isString(options.language) || options.language.length !== 2) throw new Error('`opt.language` must be an ISO 639-1 language code')

	const endpoint = 'https://timetable.eurail.com/v1/timetable/trip'
	const query = stringify({
		lang: options.language,
		originId: formatInputId(origin),
		destId: formatInputId(destination),
		date: moment.tz(options.when, 'Europe/Berlin').format('YYYY-MM-DD'),
		time: moment.tz(options.when, 'Europe/Berlin').format('HH:mm')
	})
	const url = `${endpoint}?${query}`

	let results = await fetch(url)
	results = await results.json()

	if (!results.Trip) return []
	return results.Trip.map(createJourney)
}

module.exports = journeys
