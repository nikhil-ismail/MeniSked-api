const handleRegister = (req, res, db, bcrypt) => {
	const {email, firstname, lastname, password, department, isadmin} = req.body;
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	let colour = '';
	let colours = '';

	db.select('colours').from('other').then(clrs => {
		colours = clrs[0].colours;
		db('users').count('id').then(ctr => {
			colour = colours[ctr[0].count];
			db.transaction(trx => {
				trx.insert({
					hash: hash,
					email: email
				})
				.into('login')
				.returning('email')
				.then(loginemail => {
					return trx('users')
						.returning('*')
						.insert({
							email: loginemail[0],
							firstname: firstname,
							lastname: lastname,
							colour: colour,
							department: department,
							isadmin: isadmin,
							isactive: true,
							worksked: []
						})
						.then(user => {
							res.json(user[0]);
						})
					})
				.then(trx.commit)
				.catch(trx.rollback)
			})
			.catch(err => res.status(400).json('error while registering'));
		});
	});
}

module.exports = {
	handleRegister
};