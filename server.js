require('dotenv').config();
const express = require('express');
const cors = require('cors');
const shortid = require('shortid');
const validurl = require('valid-url')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({extended:true}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//creat database in connectivity
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shorturl')
.then(()=>console.log('connection successfull'))
.catch((e)=>console.log(e))

const urlschema = new mongoose.Schema({
  original_url:String,
  short_url:String
})
const Url = mongoose.model('Url',urlschema)

// Your first API endpoint

app.get('/api/shorturl/:short_url', async function(req, res) {
  const shortcode = req.params.short_url
  let url = await Url.findOne({short_url:shortcode})
  console.log(url)
  try {
    if(url){
      console.log(url.original_url)
      return res.redirect(url.original_url)
    }else{
      return res.json({error:'No url found'})
    }
  } catch (error) {
    console.log(error), res.json({error:'server error'})
  }
})


app.post('/api/shorturl', async function(req, res) {
  try{
    const url = req.body.url
     const urlcode = shortid.generate()
    if(!validurl.isWebUri(url)){
      res.json({error:'invalid url'})
    }else{
      const result = await new Url({original_url:url,short_url:urlcode})
      await result.save()
      res.json({original_url:result.original_url,short_url:result.short_url})
      console.log(result)
    }
  }catch (error) {
      console.log(error), 
      res.json({error:'server error'})
  }
}); 

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
