const addCall = (req,res,db) => {
	const {name, priority, active} = req.body;
	db('entries')
		.where('priority','>=', priority)
		.increment('priority', 1)
		.returning('*')
		.then(all => {
			// res.json(all);
		})
		.catch(err => res.status(400).json('unable to increment'))

	db('entries')
		.returning('*')
		.insert({
			name: name,
			isactive: active,
			priority: priority,
			type: 1
		})
		.then(entry => {
			res.json(entry[0]);
		})
		.catch(err => res.status(404).json('could not add entry'))
}

const editCall = (req, res, db) => {
	const {id, name, priority, active} = req.body;

	let oldP = -1;

	db.select('priority')
		.from('entries')
		.where('id', '=', id)
		.then(pri => {
			oldP = pri[0].priority;
			if (oldP !== priority){
				if (oldP > priority){
					db('entries')
						.where('priority','>=', priority)
						.andWhere('priority', '<', oldP)
						.increment('priority', 1)
						.returning('*')
						.then(all => {
							// res.json(all);
						})
						.catch(err => res.status(400).json('unable to increment'))
				}
				else{
					db('entries')
						.where('priority','<=', priority)
						.andWhere('priority', '>', oldP)
						.decrement('priority', 1)
						.returning('*')
						.then(all => {
							// res.json(all);
						})
						.catch(err => res.status(400).json('unable to decrement'))
				}
			}
			db('entries')
					.where('id','=', id)
					.update({
						name: name,
						priority: priority,
						isactive: active
					})
					.returning('*')
					.then(call => {
						res.json(call[0]);
					})
					.catch(err => res.status(400).json('unable to edit'))
		})				
		.catch(err => res.status(404).json('could not access entry'))
}

const deleteCall = (req,res,db) => {
	const {id} = req.body;
	let oldP = -1;

	db.select('priority')
		.from('entries')
		.where('id', '=', id)
		.then(pri => {
			oldP = pri[0].priority;
			db('entries')
				.where('priority', '>', oldP)
				.decrement('priority', 1)
				.returning('*')
				.then(all => {
					// res.json(all);
				})
				.catch(err => res.status(400).json('unable to decrement'))
			db('entries')
				.returning('*')	
				.where('id', '=', id)
				.del()
				.then(call => {
					res.json(call[0]);
				})
				.catch(err => res.status(400).json('unable to delete'))
		})
		.catch(err => res.status(400).json('unable to access entry'))
}

const getCall = (req,res,db) => {
	db.select('*')
		.from('entries')
		.then(entries => {
			const calls = entries.filter((call => {
				return call.type === 1;
			}))
			res.json(calls);
		})
		.catch(err => res.status(400).json('unable to get calls'))
}

module.exports = {
	addCall,
	editCall,
	deleteCall,
	getCall
}