const addEntry = (req,res,db) => {
	const {name, active} = req.body;

	db('entries')
		.returning('*')
		.insert({
			name: name,
			isactive: active,
			priority: -1,
			type: 0
		})
		.then(entry => {
			res.json(entry[0]);
		})
		.catch(err => res.status(404).json('could not add entry'))
}

const deleteEntry = (req, res, db) => {
	const {id} = req.body;
	
	db('entries')
		.returning('*')
		.where('id', '=', id)
		.del()
		.then(entry => {
			res.json(entry[0]);
		})
		.catch(err => res.status(400).json('unable to delete'))
}

const editEntry = (req,res,db) => {
	const {id, name, active} = req.body;

	db('entries')
		.where('id','=', id)
		.update({
			name: name,
			isactive: active,
		})
		.returning('*')
		.then(entries => {
			res.json(entries[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}

module.exports = {
	addEntry,
	deleteEntry,
	editEntry
}