const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))

let persons = [
	{
		name: "Arto Hellas",
		number: "040-123456",
		id: 1
	},
	{
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: 2
	},
	{
		name: "Dan Abramov",
		number: "12-43-234345",
		id: 3
	},
	{
		name: "Mary Poppendieck",
		number: "39-23-6423122",
		id: 4
	}
]

const generateId = () => {
	const usedIds = [...persons].map(p => p.id)
	const id = Math.floor(Math.random() * 10000)
	if (usedIds.find(el => el === id)) {
		generateId()
	} else {
		return id
	}
}

app.get('/info', (req, res) => {
	res.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
	res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
	const id = parseInt(req.params.id)
	const person = persons.find(p => p.id === id)
	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

app.delete('/api/persons/:id', (req, res) => {
	const id = parseInt(req.params.id)
	persons = persons.filter(p => p.id !== id)
	res.status(204).end()
})

app.post('/api/persons', (req, res) => {
	const body = req.body
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'Required field(s) missing.'
		})
	}
	if (persons.some(p => p.name === body.name)) {
		return res.status(400).json({
			error: 'Name must be unique.'
		})
	}
	const person = {
		name: body.name,
		number: body.number,
		id: generateId()
	}
	persons = persons.concat(person)
	res.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})