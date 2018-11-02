'use strict'

const { fetch } = require('fetch-ponyfill')()
const { stringify } = require('query-string')

// remove 00-padding from 9-digit (uic-)ids
const parseOutputId = id => {
	id = id + ''
	if (id.length === 9 && id.slice(0, 2) === '00') return id.slice(2)
	return id
}

const createStation = s => {
	const station = {
		type: 'station',
		id: parseOutputId(s.StopLocation.extId),
		name: s.StopLocation.name
	}

	if (s.StopLocation.lon && s.StopLocation.lat) {
		station.location = {
			type: 'location',
			longitude: +s.StopLocation.lon,
			latitude: +s.StopLocation.lat
		}
	}

	station.weight = +s.StopLocation.weight
	station.products = +s.StopLocation.products

	return station
}

const stations = async (query) => {
	if (!query || typeof query !== 'string') throw new Error('query must be a string.')

	const endpoint = 'https://timetable.eurail.com/v1/timetable/location.name'
	const httpQuery = stringify({ input: query })
	const url = `${endpoint}?${httpQuery}`

	let results = await fetch(url)
	results = await results.json()

	if (!results.stopLocationOrCoordLocation) return []
	const unformattedStations = results.stopLocationOrCoordLocation.filter(result => result && result.StopLocation && result.StopLocation.extId && result.StopLocation.name)
	return unformattedStations.map(createStation)
}

module.exports = stations
