const editAccountInfo = (req,res,db) => {
	const {id} = req.params;
	const {firstname, lastname, email} = req.body;

	db.select('email')
		.from('users')
		.where('id', '=', id)
		.then(mail => {
			const eml = mail[0].email;
			db('login')
				.where('email', eml)
				.update('email', email)
				.returning('*')
				.then(person => {
					// res.json(person[0]);
				})
				.catch(err => res.status(400).json('unable to edit'))
			})
		.catch(err => res.status(400).json('unable to access user'))
	db('users')
		.where('id','=', id)
		.update({
			firstname: firstname,
			lastname: lastname,
			email: email
		})
		.returning('*')
		.then(user => {
			res.json(user[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}

const editAccountPass = (req,res,db,bcrypt) => {
	const {id} = req.params;
	const {oldPassword, newPassword} = req.body;

	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(newPassword, salt);

	db.select('email')
		.from('users')
		.where('id', '=', id)
		.then(mail => {
			const eml = mail[0].email;
			db.select('email', 'hash').from('login')
				.where('email', '=', eml)
				.then(data => {
					const isValid = bcrypt.compareSync(oldPassword, data[0].hash); // true
					if (isValid){
						db('login')
							.where('email', eml)
							.update('hash', hash)
							.returning('id', 'email')
							.then(person => {
								res.json(person[0]);
							})
							.catch(err => res.status(400).json('unable to edit'))
					}
					else{
						res.status(400).json('incorrect password')
					}
				})
				.catch(err => res.status(400).json('unable to access user'))
		})
}

const getAccount = (req,res,db) => {
	const {id} = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if (user.length){
				res.json(user[0]);
			}
			else{
				res.status(400).json('Not found')
			}
		})
		.catch(err => res.status(400).json('error getting user'))
}

module.exports = {
	editAccountInfo,
	editAccountPass,
	getAccount
}