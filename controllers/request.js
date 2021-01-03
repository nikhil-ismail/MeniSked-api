const addRequest = (req,res,db,transporter) => {
	const {docid, entryid, date, stamp} = req.body;

	db('messages')
		.returning('*')
		.insert({
			docid: docid,
			entryid: entryid,
			dates: [date],
			stamp: stamp,
			status: 'pending',
			msg: ''
		})
		.then(message => {
			res.json(message[0]);
			//MUST BE FIXED WHEN ADMIN IS CHANGED OR NEW DEPTS ARE INTRODUCED
			var mailOptions = {
			  	from: 'menisked@gmail.com',
			  	to: 'noahmeni27@gmail.com',
			  	subject: 'New Work Request',
			 	text: 'Hey Peter'+',\n\nA user has made a new work request. Please navigate to the messages section of MeniSked to respond. It will be located at the top of your list of pending requests.\n\nThank you,\nThe MeniSked Team.'
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
		.catch(err => res.status(404).json('could not add message'))
}

const editRequest = (req,res,db) => {
	const {docid, entryid, date} = req.body;
	db('messages')
		.where('docid', '=', docid)
		.andWhere('entryid', '=', entryid)
		.andWhere('status', '=', 'pending')
		.update({
			dates: db.raw('array_append(dates, ?)', [date]),
		})
		.returning('*')
		.then(message => {
			res.json(message[0]);
		})
		.catch(err => res.status(404).json('unable to edit'))
}

const cancelRequest = (req,res,db) => {
	const {docid, entryid, date, pending} = req.body;
	let index = -1;
	let index1 = -1;
	for (let i = 0; i < pending.length; i ++){
		if (parseInt(pending[i].entryid,10) === entryid){
			for (let j = 0; j < pending[i].dates.length; j++){
				if (pending[i].dates[j] === date){
					index = i;
					index1 = j;
					break;
				}
			}
		}
	}
	if (index !== -1 && index1 !== -1){
		let newpend = [...pending];
		newpend[index].dates.splice(index1,1);

		if (newpend[index].dates.length > 0){
			db('messages')
				.where('docid', '=', docid)
				.andWhere('entryid', '=', entryid)
				.andWhere('status', '=', 'pending')
				.update('dates', newpend[index].dates)
				.returning('*')
				.then(message => {
					res.json(message[0]);
				})
				.catch(err => res.status(404).json('unable to cancel request'))
		}
		else{
			db('messages')
				.returning('*')
				.where('docid', '=', docid)
				.andWhere('entryid', '=', entryid)
				.andWhere('status', '=', 'pending')
				.del()
				.then(message => {
					res.json(message[0]);
				})
				.catch(err => res.status(404).json('unable to cancel request'))
		}
	}
	else {
		res.status(404).json('unable to access request')
	}
	
}

const acceptRequest = (req,res,db) => {
	const {id} = req.body;
	let indexes = [];

	db.select('*').from('messages').where({id})
		.then(message => {
			if (message[0]){
				const {docid, entryid, dates} = message[0];
				db.select('worksked')
					.from('users')
					.where('id', '=', docid)
					.then(sked => {
						let arr = sked[0].worksked;
						for (let j = 0; j < arr.length; j++){
				 			for (let n = 0; n < dates.length; n++){
				 				if (arr[j].date === dates[n]){
					 				indexes.push(j);
								}
				 			}
						}

						indexes.sort(function(a, b){return a - b})
						for (let i = indexes.length - 1; i >= 0; i--){
							arr.splice(indexes[i],1);
						}

						for (let i = 0; i < dates.length; i++){
							arr.push({
								id: parseInt(entryid,10),
								date: dates[i]
							})
						}
					
						db('users')
							.where('id', '=', docid)
							.update('worksked', arr)
							.returning('*')
							.then(user => {
								res.json(user[0])
							})
							.catch(err => res.status(400).json('unable to assign entry'))

					})
					.catch(err => res.status(400).json('unable to access user'))

			}
			else{
				res.status(400).json('message not found')
			}
		})
		.catch(err => res.status(400).json('error getting user'))	
}

module.exports = {
	addRequest,
	editRequest,
	cancelRequest,
	acceptRequest
}