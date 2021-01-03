const getDepts = (req,res,db) => {
	db.select('*')
		.from('departments')
		.then(depts => {
			res.json(depts);
		})
		.catch(err => res.status(400).json('unable to get departments'))
}

module.exports = {
	getDepts
}