const express = require('express');
const bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require("nodemailer");
var genPass = require("password-generator");
const knex = require('knex');

const register = require('./controllers/register');
const login = require('./controllers/login');
const holiday = require('./controllers/holiday');
const calltype = require('./controllers/calltype');
const people = require('./controllers/people');
const account = require('./controllers/account');
const sked = require('./controllers/sked');
const entries = require('./controllers/entries');
const messages = require('./controllers/messages');
const request = require('./controllers/request');
const published = require('./controllers/published');
const departments = require('./controllers/departments');

const db = knex({
	client: 'pg',
  	connection: {
    	host : '127.0.0.1',
    	user : 'noah.menikefs',
    	password : '',
    	database : 'meniSked'
    }
});

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(cors())

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'menisked@gmail.com',
    pass: 'PDM"jxRv4C*aAmAB'
  }
});

//Checks if a user's login info is correct
app.post('/login', (req, res) => {login.handleLogin(req,res,db,bcrypt)})

//User forgot password
app.post('/forgot', (req, res) => {login.forgotPassword(req,res,db,bcrypt,genPass,transporter)})

//Adds a new user to the "database"
app.post('/register', (req,res) => {register.handleRegister(req, res, db, bcrypt) })

//Adding a recurring holiday
app.post('/holiday/r', (req,res) => {holiday.addRecurring(req,res,db)})

//Editing a recurring holiday
app.put('/holiday/r', (req,res) => {holiday.editRecurring(req,res,db)})

//Getting holidays
app.get('/holiday/:type', (req,res) => {holiday.getHoliday(req,res,db)})

//Deleting a holiday
app.delete('/holiday/:type', (req,res) => {holiday.deleteHoliday(req,res,db)})

//Adding a non-recurring holiday
app.post('/holiday/nr', (req,res) => {holiday.addNonRecurring(req,res,db)})

//Scheduling a non-recurring holiday
app.put('/holiday/snr', (req,res) => {holiday.skedHoliday(req,res,db)})

//Deleting a date from a holiday's schedule
app.put('/holiday/esnr', (req,res) => {holiday.editSked(req,res,db)})

//Adding a call type
app.post('/callTypes', (req,res) => {calltype.addCall(req,res,db)})

//Editing a call type
app.put('/callTypes', (req,res) => {calltype.editCall(req,res,db)})

//Deleting a call type
app.delete('/callTypes', (req,res) => {calltype.deleteCall(req,res,db)})

//Getting call types
app.get('/callTypes', (req,res) => {calltype.getCall(req,res,db)})

//Adding a user
app.post('/people', (req,res) => {people.addUser(req,res,db,genPass,bcrypt,transporter)})

//Editing a user
app.put('/people', (req,res) => {people.editUser(req,res,db)})

//Deleting a user
app.delete('/people', (req,res) => {people.deleteUser(req,res,db)})

//Getting all users
app.get('/people', (req,res) => {people.getUser(req,res,db)})

//Editing account information
app.put('/account/:id', (req,res) => {account.editAccountInfo(req,res,db)})

//Editing account's password
app.post('/account/:id', (req,res) => {account.editAccountPass(req,res,db,bcrypt)})

//Getting user's account information
app.get('/account/:id', (req,res) => {account.getAccount(req,res,db)})

//Add note
app.post('/sked/notes', (req,res) => {sked.addNote(req,res,db)})

//Getting all notes 
app.get('/sked/allNotes', (req,res) => {sked.getNotes(req,res,db)})

//Get active doctors
app.get('/sked/docs', (req,res) => {sked.getDocs(req,res,db)})

//Get entry types
app.get('/sked/entries', (req,res) => {sked.getEntries(req,res,db)})

//Admin assign entry
app.post('/sked/assign', (req,res) => {sked.assignEntry(req,res,db)})

//Admin delete call
app.delete('/sked/assign', (req,res) => {sked.deleteSkedCall(req,res,db)})

//Add entry type
app.post('/entries', (req,res) => {entries.addEntry(req,res,db)})

//Delete entry type
app.delete('/entries', (req,res) => {entries.deleteEntry(req,res,db)})

//Edit entry type
app.put('/entries', (req,res) => {entries.editEntry(req,res,db)})

//Get published months
app.get('/published', (req,res) => {published.getMonths(req,res,db)})

//Update published months
app.put('/published', (req,res) => {published.updateMonths(req,res,db)})

//Get all messages 
app.get('/amessages', (req,res) => {messages.getAllMessages(req,res,db)})

//Get employee's messages
app.get('/emessages/:id', (req,res) => {messages.getEmployeeMessages(req,res,db)})

//Admin responding to a pending request
app.put('/amessages', (req,res) => {messages.messageResponse(req,res,db,transporter)})

//Employee making a request
app.post('/request', (req,res) => {request.addRequest(req,res,db,transporter)})

//Employee editing a request's dates
app.put('/request', (req,res) => {request.editRequest(req,res,db)})

//Employee cancelling a request
app.put('/drequest', (req,res) => {request.cancelRequest(req,res,db)})

//Admin accepting a request (updates the employee's workSked)
app.put('/arequest', (req,res) => {request.acceptRequest(req,res,db)})

//Get all the departments with MeniSked
app.get('/departments', (req,res) => {departments.getDepts(req,res,db)})

let port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`app is running on port ${port}`);
})