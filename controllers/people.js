const addUser = (req, res, db, genPass, bcrypt,transporter) => {
	const {email, firstname, lastname, department} = req.body;

	const password = genPass(16, false);
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	let colour = '';
	let colours = '';

	var mailOptions = {
	  	from: 'menisked@gmail.com',
	  	to: email,
	  	subject: 'Welcome to MeniSked!',
	 	text: 'Hey '+firstname+',\n\nYour administrator has set up your MeniSked account and you have been given a temporary password: '+password+'. Please login using this password and immediately navigate to the account page. Here you will be able to change it to something easier to remember.\n\nThank you,\nThe MeniSked Team.'
	};

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
							isadmin: false,
							isactive: true,
							worksked: []
						})
						.then(user => {
							transporter.sendMail(mailOptions, function(error, info){
  								if (error) {
    								console.log(error);
  								}
							})
							res.json(user[0]);
						})
					.then(trx.commit)
					.catch(trx.rollback)
				})
			.catch(err => res.status(400).json('error while registering'));
			});
		});
	});
}

const editUser = (req, res, db) => {
	const {id, isactive} = req.body;
	db('users')
		.where('id','=', id)
		.update({
			isactive: isactive
		})
		.returning('*')
		.then(user => {
			res.json(user[0]);
		})
		.catch(err => res.status(400).json('unable to edit'))
}

const deleteUser = (req,res,db) => {
	const {email} = req.body;
	db('users')
		.returning('*')
		.where('email', email)
		.del()
		.then(user => {
			db('login')
				.returning('*')
				.where('email', email)
				.del()
				.then(user => {
					res.json(user[0]);
				})
				.catch(err => res.status(400).json('unable to delete'))
			})
		.catch(err => res.status(400).json('unable to delete'))
	
}

const getUser = (req, res, db) => {
	db.select('*')
		.from('users')
		.then(users => {
			const ppl = users.sort(function(a, b){
				if (a.lastname < b.lastname) { return -1; }
				if (a.lastname > b.lastname) { return 1; }
				return 0;
			});
			res.json(ppl);
		})
		.catch(err => res.status(400).json('unable to get users'))
}

module.exports = {
	addUser,
	editUser,
	deleteUser,
	getUser
}