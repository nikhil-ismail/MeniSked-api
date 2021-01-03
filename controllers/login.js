const handleLogin = (req, res, db, bcrypt) => {
	const {email, password} = req.body;
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash); // true
			
			if (isValid){
				return db.select('*').from('users')
					.where('email','=',email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
			}
			else{
				res.status(400).json('wrong credentials')
			}
		})
	.catch(err => res.status(400).json('wrong credentials'))
}

const forgotPassword = (req, res, db, bcrypt, genPass,transporter) => {
	const {email} = req.body;
	const password = genPass(16, false);
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	let name = ''

	db.select('*')
		.from('users')
		.where('email', email)
		.then(user => {
			name = user[0].firstname
			db('login')
				.where('email', email)
				.update('hash', hash)
				.returning('id','email')
				.then(user => {
					res.json(user[0]);
					var mailOptions = {
			  			from: 'menisked@gmail.com',
			  			to: email,
			  			subject: 'Recover your MeniSked Password.',
			 	 		text: 'Hey '+name+',\n\nLooks like you forgot your password. Please login to your account using the temporary password: '+password+'. Once signed in, navigate to the account page and change your password to something easier to remember.\n\nThank you,\nThe MeniSked Team.'
					};

					transporter.sendMail(mailOptions, function(error, info){
		  				if (error) {
		    				res.json(error);
		  				} 
		  				if (info){
		  					res.json(info.response);
		  				}
					});
				})
				.catch(err => res.status(400).json('unable to edit'))
				})
		.catch(err => res.status(400).json('unable to get user'))
}

module.exports = {
	handleLogin,
	forgotPassword
}