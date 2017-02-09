'use strict'

const h = require('./helpers')

const parse = (result) => {
	if(result.StopLocation && result.StopLocation.extId && result.StopLocation.name){
		const res = {}

		res.name = result.StopLocation.name
		res.id = +result.StopLocation.extId
		if(result.StopLocation.lon && result.StopLocation.lat){
			res.coords = {
				lon: result.StopLocation.lon,
				lat: result.StopLocation.lat
			}
		}
		res.weight = +result.StopLocation.weight
		res.products = +result.StopLocation.products
		return res
	}
	return null
}

const locations = (query) => 
	h.request('https://timetable.eurail.com/v1/timetable/location.name', {
		input: query
	})
	.then((res) => res.stopLocationOrCoordLocation || [])
	.then((res) => res.map(parse))
	.then(h.removeEmpty)

module.exports = locations