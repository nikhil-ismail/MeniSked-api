const addRecurring = (req,res, db) => {
	const {name, month, day, isactive} = req.body;
	db('rholidays')
		.returning('*')
		.insert({
			name: name,
			isactive: isactive,
			month: month,
			day: day
		})
		.then(holiday => {
			res.json(holiday[0]);
		})
		.catch(err => res.status(404).json('could not add holiday'))
}

const editRecurring = (req,res,db) => {
	const {isactive, name, month, day} = req.body;
	db('rholidays')
		.where('name','=', name)
		.update({
			isactive: isactive,
			month: month,
			day: day
		})
		.returning('*')
		.then(all => {
			res.json(all[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}

const getHoliday = (req,res,db) => {
	const {type} = req.params;
	db.select('*')
		.from(type+'holidays')
		.then(holidays => {
			res.json(holidays);
		})
		.catch(err => res.status(400).json('unable to get holiday'))
}

const deleteHoliday = (req,res,db) => {
	const {type} = req.params;
	const {name} = req.body;
	
	db(type+'holidays')
		.returning('*')
		.where('name', '=', name)
		.del()
		.then(holiday => {
			res.json(holiday[0]);
		})
}

const addNonRecurring = (req,res,db) => {
	const {name} = req.body;
	db('nrholidays')
		.returning('*')
		.insert({
			name: name,
			eventsked: []
		})
		.then(holiday => {
			res.json(holiday[0]);
		})
		.catch(err => res.status(404).json('could not add holiday'))
}

const skedHoliday = (req,res,db) => {
	const {name, year, month, day} = req.body;
	db('nrholidays')
		.where('name','=', name)
		.update({
			eventsked: db.raw('array_append(eventsked, ?)', [month+'/'+day+'/'+year])
		})
		.returning('*')
		.then(all => {
			res.json(all[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}

const editSked = (req,res,db) => {
	const {id, arr} = req.body;
	db('nrholidays')
		.where('id','=', id)
		.update({
			eventsked: arr
		})
		.returning('*')
		.then(all => {
			res.json(all[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}



module.exports = {
	addRecurring,
	editRecurring,
	getHoliday,
	deleteHoliday,
	addNonRecurring,
	skedHoliday,
	editSked
}