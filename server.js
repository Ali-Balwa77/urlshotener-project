require('dotenv').config();
const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const validurl = require('valid-url')
const dns = require('dns')

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//creat database in connectivity
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shorturl')
.then(()=>console.log('connection successfull'))
.catch((e)=>console.log(e))

const urlschema = new mongoose.Schema({
  origin_url:String,
  short_url:String
})
const Url = mongoose.model('Url',urlschema)

// Your first API endpoint

app.get('/api/shorturl/:short_url', async function(req, res) {
  const urlcode = req.params.short_url
  let result = await Url.findOne({urlcode})
  .then(result?res.redirect(result.origin_url):res.json({error:'No url found'}))
  .catch((err)=>{console.log(err), res.json({error:'server error'})})
})


app.post('/api/shorturl/new', async function(req, res) {
  const url = req.body.url
  const urlcode = shortid.generate()

  if(!validurl.isWebUri(url)){
    res.json({error:'Invalid URL'})
  }else{
    let result = await Url.findOne({
      origin_url:url
    })
    .then(result?res.json({origin_url:result.origin_url,short_url:result.short_url}) : result = await new Url({origin_url:url,short_url:urlcode}),
      await result.save(),
      res.json({origin_url:result.origin_url,short_url:result.short_url})
    )
    .catch((err)=>{console.log(err), res.json({error:'server error'})})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
