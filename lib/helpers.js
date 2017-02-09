'use strict'

const got = require('got')

const request = (url, opt) => {
	return got(url, {json: true, query: opt})
	.then((res) => res.body)
}

const removeEmpty = (array) => {
	const res = []
	for(let el of array) if(el) res.push(el)
	return res
}

module.exports = {request, removeEmpty}