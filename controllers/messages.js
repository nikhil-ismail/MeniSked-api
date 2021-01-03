const getAllMessages = (req,res,db) => {
	db.select('*')
		.from('messages')
		.then(messages => {
			res.json(messages);
		})
		.catch(err => res.status(400).json('unable to get messages'))
}

const getEmployeeMessages = (req,res,db) => {
	const {id} = req.params;
	db.select('*')
		.from('messages')
		.where('docid', '=', id)
		.then(messages => {
			res.json(messages);
		})
		.catch(err => res.status(400).json('unable to get messages'))
}

const messageResponse = (req,res,db,transporter) => {
	const {id, status, msg, stamp} = req.body;
	db('messages')
		.where('id','=', id)
		.update({
			status: status,
			msg: msg,
			stamp: stamp
		})
		.returning('*')
		.then(message => {
			res.json(message[0])
			const docid =  message[0].docid;
			db.select('*').from('users').where('id', '=', docid)
				.then(user => {
					if (user.length > 0){
						var mailOptions = {
			  				from: 'menisked@gmail.com',
			  				to: user[0].email,
			  				subject: 'Your Administator Has Responded to Your Request',
			 	 			text: 'Hey '+user[0].firstname+',\n\nYour administator has responded to one of your work requests. To view their response please navigate to the messages section of MeniSked. The request will appear at the top of your list.\n\nThank you,\nThe MeniSked Team.'
						};
						transporter.sendMail(mailOptions, function(error, info){
		  					if (error) {
		    					res.json(error);
			  				} 
			  				if (info){
			  					res.json(info.response);
			  				}
						});
					}
					else{
						res.status(400).json('Not found')
					}
				})
				.catch(err => res.status(400).json('unable to access user'))
		})
		.catch(err => res.status(400).json('unable to respond'))
}


module.exports = {
	getAllMessages,
	getEmployeeMessages,
	messageResponse
}