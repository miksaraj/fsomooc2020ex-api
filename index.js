require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))

app.get('/info', (req, res) => {
	Person.countDocuments({}).then(c => {
		res.send(`<p>Phonebook has info for ${c} people.</p><p>${new Date()}</p>`)
	})
})

app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons => {
		res.json(persons)
	})
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
	.then(person => {
		if (person) {
			res.json(person)
		} else {
			res.status(404).end()
		}
	})
	.catch(e => next(e))
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body
	const person = new Person({
		name: body.name,
		number: body.number
	})
	person.save()
	.then(savedPerson => savedPerson.toJSON())
	.then(savedAndFormattedPerson => {
		res.json(savedAndFormattedPerson)
	})
	.catch(e => next(e))
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body
	const person = {
		name: body.name,
		number: body.number
	}
	Person.findByIdAndUpdate(req.params.id, person, { new: true })
	.then(updatedPerson => {
		res.json(updatedPerson)
	})
	.catch(e => {
		console.log(e.name)
		next(e)
	})
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
	.then(r => {
		res.status(204).end()
	})
	.catch(e => next(e))
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (e, req, res, next) => {
	console.error(e.message)
	if (e.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (e.name === 'ValidationError') {
		return res.status(400).json({ error: e.message })
	}
	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})