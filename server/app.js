const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors =  require('cors');
const path = require('path');

const app = express();

const env = (process.env.NODE_ENV == 'production')  ?  'prod' : 'dev';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://username:password@ds127139.mlab.com:27139/bookstore')
  .then(res => console.log("connected to database"))
  .catch(err => console.log(err.message));

app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.use(express.static(path.join(__dirname, '../client/public')));
//app.use('*', express.static(path.join(__dirname, '../client/public')));

app.get('*', (req, res)=>{  
  if(env=='prod'){
    //res.send('Directory Not Found: in prod mode'+req.url);
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
  }else{
    res.send('Directory Not Found: in dev mode');
  }
});

const port = process.env.PORT || 1234
app.listen(port, ()=> console.log(`Listening to port: ${port}`));