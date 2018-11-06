'use strict'

const { stationsSearch: validateArguments } = require('fpti-util').validateMethodArguments
const { fetch } = require('fetch-ponyfill')()
const { stringify } = require('query-string')
const take = require('lodash/take')
const merge = require('lodash/merge')

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

const defaults = { results: null }

const search = async (query, opt = {}) => {
	const options = merge({}, defaults, opt)
	validateArguments(query, options)

	const endpoint = 'https://timetable.eurail.com/v1/timetable/location.name'
	const httpQuery = stringify({ input: query })
	const url = `${endpoint}?${httpQuery}`

	let results = await fetch(url)
	results = await results.json()

	if (!results.stopLocationOrCoordLocation) return []
	const unformattedStations = results.stopLocationOrCoordLocation.filter(result => result && result.StopLocation && result.StopLocation.extId && result.StopLocation.name)
	const stations = unformattedStations.map(createStation)

	if (options.results) return take(stations, options.results)
	return stations
}
search.features = { results: 'Max. number of results returned' } // required by fpti

module.exports = { search }
