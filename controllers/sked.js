const addNote = (req, res, db) => {
	const {date, msg, type} = req.body;

	db('notes')
		.returning('*')
		.insert({
			type: type,
			date: date,
			msg: msg,
		})
		.then(note => {
			res.json(note[0]);
		})
		.catch(err => res.status(404).json('could not add note'))
}

const getNotes = (req, res, db) => {
	db.select('*')
		.from('notes')
		.then(notes => {
			res.json(notes);
		})
		.catch(err => res.status(400).json('unable to get notes'))
}

const getDocs = (req, res, db) => {
	db.select('*')
		.from('users')
		.then(users => {
			const arr = users.filter((user => {
				return user.isactive === true;
			}))
			const docs = arr.sort(function(a, b){
				if (a.lastname < b.lastname) { return -1; }
				if (a.lastname > b.lastname) { return 1; }
				return 0;
			});
			res.json(docs);
		})
		.catch(err => res.status(400).json('unable to get docs'))
}

const getEntries = (req,res, db) => {
	db.select('*')
		.from('entries')
		.then(entries => {
			const entrs = entries.filter((entry => {
				return entry.type === 0;
			}))
			res.json(entrs);
		})
		.catch(err => res.status(400).json('unable to get entries'))
}

const assignEntry = (req,res, db) => {
	const {docId, typeId, date} = req.body;
	let index = -1

	db.select('worksked')
		.from('users')
		.where('id', '=', docId)
		.then(sked => {
			let arr = sked[0].worksked;
			for (let j = 0; j < arr.length; j++){
	 			if (arr[j].date === date){
	 				index = j;
	 				break;
				}
			}
			if (index !== -1){
				arr.splice(index,1);
			}

			arr.push({
				id: typeId,
				date: date
			})

			db('users')
				.where('id', '=', docId)
				.update('worksked', arr)
				.returning('*')
				.then(user => {
					res.json(user[0])
				})
				.catch(err => res.status(400).json('unable to assign entry'))

		})
		.catch(err => res.status(400).json('unable to access user'))
}

const deleteSkedCall = (req,res, db) => {
	const {docId, date, typeId} = req.body;
	
	db.select('worksked')
		.from('users')
		.where('id', '=', docId)
		.then(sked => {
			const arr = sked[0].worksked;
			for (let j = 0; j < arr.length; j++){
	 			if (arr[j].date === date){
	 				index = j;
	 				break;
				}
			}
			if (index !== -1){
				arr.splice(index,1);
			}

			db('users')
				.where('id', '=', docId)
				.update('worksked', arr)
				.returning('*')
				.then(user => {
					res.json(user[0])
				})
				.catch(err => res.status(400).json('unable to delete entry'))

		})
		.catch(err => res.status(400).json('unable to access user'))
}

module.exports = {
	addNote,
	getNotes,
	getDocs,
	getEntries,
	assignEntry,
	deleteSkedCall
}