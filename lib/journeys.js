'use strict'

const moment = require('moment-timezone')
const h = require('./helpers')

const formatId = (id) => '00' + ((id + '').slice(-7))

const parseLeg = (leg) => {
	const res = {}
	// origin
	res.origin = {
		type: 'station',
		name: leg.Origin.name,
		id: +leg.Origin.extId
	}
	if (leg.Origin.lon && leg.Origin.lat) {
		res.origin.coordinates = {
			longitude: +leg.Origin.lon,
			latitude: +leg.Origin.lat
		}
	}
	// destination
	res.destination = {
		type: 'station',
		name: leg.Destination.name,
		id: +leg.Destination.extId
	}
	if (leg.Destination.lon && leg.Destination.lat) {
		res.destination.coordinates = {
			longitude: +leg.Destination.lon,
			latitude: +leg.Destination.lat
		}
	}
	res.departure = moment.tz(leg.Origin.date + '_' + leg.Origin.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()
	res.arrival = moment.tz(leg.Destination.date + '_' + leg.Destination.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()
	res.line = leg.name
	if (leg.Product) {
		res.operator = leg.Product.operator
	}

	return res
}

const parseJourney = (journey) => ({ type: 'journey', legs: journey.LegList.Leg.map(parseLeg) })

const journeys = (origin, destination, date) => {
	if (!origin || !destination) return []
	date = moment(date || null).tz('Europe/Berlin')

	return h.request('https://timetable.eurail.com/v1/timetable/trip', {
		lang: 'en',
		originId: formatId(origin),
		destId: formatId(destination),
		date: date.format('YYYY-MM-DD'),
		time: date.format('HH:mm')
	})
		.then((res) => res.Trip || [])
		.then((res) => res.map(parseJourney))
}

module.exports = journeys
