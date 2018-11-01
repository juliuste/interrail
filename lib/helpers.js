'use strict'

const { fetch } = require('fetch-ponyfill')({ Promise: require('pinkie-promise') })
const qs = require('query-string').stringify

const request = (url, opt) =>
	fetch(`${url}?${qs(opt)}`, { method: 'get' })
		.then((res) => {
			if (!res.ok) {
				const err = new Error(res.statusText)
				err.statusCode = res.status
				throw err
			}
			return res.json()
		})

const removeEmpty = (array) => {
	const res = []
	for (let el of array) if (el) res.push(el)
	return res
}

module.exports = { request, removeEmpty }
