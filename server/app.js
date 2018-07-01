const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors =  require('cors');
const path = require('path');

const app = express();

const env = (process.env.NODE_ENV == 'PROD')  ?  'prod' : 'dev';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://username:password@ds127139.mlab.com:27139/bookstore')
  .then(res => console.log("connected to database"))
  .catch(err => console.log(err.message));

app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

if(env=='prod'){
  console.log(process.env.NODE_ENV);
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.use('*', express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res)=>{
  if(env=='prod'){
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  }else{
    res.send('res');
  }
});

const port = process.env.PORT || 1234
app.listen(port, ()=> console.log(`Listening to port: ${port}`));