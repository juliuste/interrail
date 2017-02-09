'use strict'

const moment = require('moment-timezone')
const h = require('./helpers')

const formatId = (id) => '00'+((id+'').slice(-7))

const parseLeg = (leg) => {
	const res = {}
	// from
	res.from = {
			name: leg.Origin.name,
			id: +leg.Origin.extId
	}
	if(leg.Origin.lon && leg.Origin.lat){
		res.from.coords = {
			lon: +leg.Origin.lon,
			lat: +leg.Origin.lat
		}
	}
	// to
	res.to = {
			name: leg.Destination.name,
			id: +leg.Destination.extId
	}
	if(leg.Destination.lon && leg.Destination.lat){
		res.to.coords = {
			lon: +leg.Destination.lon,
			lat: +leg.Destination.lat
		}
	}
	res.departure = moment.tz(leg.Origin.date+'_'+leg.Origin.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()
	res.arrival = moment.tz(leg.Destination.date+'_'+leg.Destination.time, 'YYYY-MM-DD_HH:mm:ss', 'Europe/Berlin').format()
	res.line = leg.name
	if(leg.Product){
		res.operator = leg.Product.operator
	}

	return res
}

const parseRoute = (route) => ({parts: route.LegList.Leg.map(parseLeg)})

const routes = (from, to, date) => {
	if(!from || !to) return []
	date = moment(date || null).tz('Europe/Berlin')
	
	return h.request('https://timetable.eurail.com/v1/timetable/trip', {
		lang: 'en',
		originId: formatId(from),
		destId: formatId(to),
		date: date.format('YYYY-MM-DD'),
		time: date.format('HH:mm')
	})
	.then((res) => res.Trip || [])
	.then((res) => res.map(parseRoute))
}

module.exports = routes