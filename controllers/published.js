const updateMonths = (req,res,db) => {
	const {newNum} = req.body;
	db('other').update('published', newNum)
	.returning('published')
	.then(published => {
		res.json(parseInt(published[0],10));
	})
	.catch(err => res.status(400).json('unable to get published'))
}

const getMonths = (req,res,db) => {
	db.select('published')
		.from('other')
		.then(num => {
			res.json(parseInt(num[0].published,10));
		})
		.catch(err => res.status(400).json('unable to get num'))
}

module.exports = {
	updateMonths,
	getMonths
}