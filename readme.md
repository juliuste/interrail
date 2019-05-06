# interrail

Find european train stations and journeys. Client for the European [Interrail](http://interrail.eu) / EuRail API. Inofficial, using endpoints by *Interrail/EuRail*. Ask them for permission before using this module in production.

This module conforms to the [FPTI-JS `0.3.2` standard](https://github.com/public-transport/fpti-js/tree/0.3.2) for JavaScript public transportation modules.

[![npm version](https://img.shields.io/npm/v/interrail.svg)](https://www.npmjs.com/package/interrail)
[![Build Status](https://travis-ci.org/juliuste/interrail.svg?branch=master)](https://travis-ci.org/juliuste/interrail)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/interrail.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/interrail.svg)](https://david-dm.org/juliuste/interrail)
[![license](https://img.shields.io/github/license/juliuste/interrail.svg?style=flat)](LICENSE)
[![fpti-js version](https://fpti-js.badges.juliustens.eu/badge/juliuste/interrail)](https://fpti-js.badges.juliustens.eu/link/juliuste/interrail)
[![chat on gitter](https://badges.gitter.im/public-transport.svg)](https://gitter.im/public-transport)

## Installation

```sh
npm install interrail
```

## Usage

```js
const interrail = require('interrail')
```

The `interrail` module conforms to the [FPTI-JS `0.3.2` standard](https://github.com/public-transport/fpti-js/tree/0.3.2) for JavaScript public transportation modules and exposes the following methods:

Method | Feature description | [FPTI-JS `0.3.2`](https://github.com/public-transport/fpti-js/tree/0.3.2)
-------|---------------------|--------------------------------------------------------------------
[`stations.search(query, [opt])`](#stationssearchquery-opt) | Search stations by *query*. | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.search.md)
[`journeys(origin, destination, [opt])`](#journeysorigin-destination-opt) | Journeys between stations | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md)

---

### `stations.search(query, [opt])`

Search stations by *query*. See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.search.md).

#### Supported Options

Attribute | Description | FPTI-spec | Value type | Default
----------|-------------|------------|------------|--------
`results` | Max. number of results returned | ✅ | `Number` | `null`

#### Example

```js
interrail.stations.search('Ljubl', { results: 1 }).then(…)
```

```js
[
	{
		"type": "station",
		"id": "7942300",
		"name": "LJUBLJANA (Slovenia)",
		"location": {
			"type": "location",
			"longitude": 14.51028,
			"latitude": 46.058057
		},
		"weight": 12185,
		"products": 28
	}
]
```

---

### `journeys(origin, destination, [opt])`

Find journeys between stations. See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md).

#### Supported Options

Attribute | Description | FPTI-spec | Value type | Default
----------|-------------|------------|------------|--------
`when` | Journey date, synonym to `departureAfter` | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`departureAfter` | List journeys with a departure (first leg) after this date | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`results` | Max. number of results returned | ✅ | `Number` | `null`
`interval` | Results for how many minutes after `when`/`departureAfter` | ✅ | `Number` | `null`
`transfers` | Max. number of transfers | ✅ | `Number` | `null`
`language` | Language of the results | ❌ | [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) | `null`

#### Example

```js
const berlin = '8065969' // station id
const ljubljana = { // FPTF station
	type: 'station',
	id: '7942300',
	name: 'Ljubljana'
	// …
}

interrail.journeys(berlin, ljubljana, { when: new Date('2018-11-02T05:00:00+0200') }).then(…)
```

```js
[
	{
		"id": "8065969-2018-11-02t06-37-00…",
		"legs": [
			{
				"arrival": "2018-11-02T06:54:00+01:00",
				"departure": "2018-11-02T06:37:00+01:00",
				"destination": {
					"id": "8003025",
					"location": {
						"latitude": 52.534722,
						"longitude": 13.196947,
						"type": "location"
					},
					"name": "BERLIN-SPANDAU (Germany)",
					"type": "station"
				},
				"id": "8065969-2018-11-02t06-37-00-01-00-8003025-2018-11-02t06-54-00-01-00-rb-18604",
				"line": {
					"id": "rb-18604",
					"mode": "train",
					"name": "RB 18604",
					"public": true,
					"type": "line"
				},
				"mode": "train",
				"operator": "interrail",
				"origin": {
					"id": "8065969",
					"location": {
						"latitude": 52.525553,
						"longitude": 13.369441,
						"type": "location"
					},
					"name": "BERLIN HBF (Germany)",
					"type": "station"
				},
				"public": true
			}
			// …
			{
				"arrival": "2018-11-02T18:32:00+01:00",
				"departure": "2018-11-02T12:17:00+01:00",
				"destination": {
					"id": "7942300",
					"location": {
						"latitude": 46.058057,
						"longitude": 14.51028,
						"type": "location"
					},
					"name": "LJUBLJANA (Slovenia)",
					"type": "station"
				},
				"id": "8020347-2018-11-02t12-17-00-01-00-7942300-2018-11-02t18-32-00-01-00-ec-113",
				"line": {
					"id": "ec-113",
					"mode": "train",
					"name": "EC   113",
					"public": true,
					"type": "line"
				},
				"mode": "train",
				"operator": "interrail",
				"origin": {
					"id": "8020347",
					"location": {
						"latitude": 48.140274,
						"longitude": 11.55833,
						"type": "location"
					},
					"name": "MUENCHEN HBF (Germany)",
					"type": "station"
				},
				"public": true
			}
		],
		"type": "journey"
	}
	// …
]
```

## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/interrail/issues).
