const express = require('express');

require('dotenv').config()

const app = express();
const PORT = 3000 || process.env.PORT;
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

const { loadGoogleSpreadSheet } = require('./spreadsheet');

app.get('/', async (req, res) => {

  const doc = await loadGoogleSpreadSheet();
	const sheet = doc.sheetsByIndex[0]; // the first sheet
	const books = await sheet.getRows({ orderBy: 'category'});
		
	res.render('index', { books })
})

app.get('/admin', async (req, res) => {
	const doc = await loadGoogleSpreadSheet();
	const sheet = doc.sheetsByIndex[0]; // the first sheet
	const books = await sheet.getRows({ orderBy: 'category'});
		
	res.render('admin', { books })
})

app.get('/books', (req, res) => {
	res.render('book-form');
})

app.get('/books/:id', async (req, res) => {
	const doc = await loadGoogleSpreadSheet();
	const sheet = doc.sheetsByIndex[0]; // the first sheet
	const books = await sheet.getRows({ orderBy: 'category'});
		
	res.render('admin', { books })
})


app.post('/books', async (req, res) => {	
	const { title, publisher, year, category, author, ISBN} = req.body;

	if(title.trim() == '' || publisher.trim() == '' || year.trim() == '' || category.trim() == '' )
		res.status(400).json({msg: "<strong>Oops! </strong> Please fill-up all <strong class='has-text-info'>*Required</strong> fields."});

	else if( isNaN(year) || (year <= 2000 || year > 	new Date().getFullYear()) )
		return res.status(400).json({msg: "<strong>Oops! </strong> Year is not valid."});
	
   else {
 		if(author.trim() !== '')
 			author_json = JSON.stringify(author.split(',').map( item => item.trim()));
 	
 		try {
 			const doc = await loadGoogleSpreadSheet();
	 		const sheet = doc.sheetsByIndex[0]; 
	 
	 		const row = await sheet.addRow({title, publisher, year, category, author: author_json, ISBN});
	 		res.json({ msg: "<strong>Success! </strong> You have added new e-book in the collection"});	

	 	} catch(error) {
	 		res.status(500).json({msg: "<strong>Oops! </strong> Something went wrong."})
	 	} 
 	 }
})

app.delete('/books/:id', async (req,res) => {
	const id = req.params.id;
	try {
	 const doc = await loadGoogleSpreadSheet();
	 const sheet = doc.sheetsByIndex[0]; // the first sheet
	 const books = await sheet.getRows({ orderBy: 'category'});

	 await books[id].delete();
	 	res.json({ msg: "<strong>Success! </strong> You have deleted an e-book successfully."});	
	}	catch(error) {
 		res.status(500).json({msg: "<strong>Oops! </strong> Something went wrong."})
 	} 
	 
})


app.listen(PORT, () => console.log('Connected to port ', PORT))