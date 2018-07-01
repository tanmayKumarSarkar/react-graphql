import React, { Component } from 'react';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import BookList from './components/BookList';
//import AuthorList from './components/AuthorList';
import AddBook from './components/AddBook';


const client = new ApolloClient({
  uri: "/graphql"
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
         <div className="App" id="main">
        <h1>Reading List</h1>
        <BookList />
        <AddBook />
        {/* <AuthorList /> */}
      </div>
      </ApolloProvider>
    );
  }
}

export default App;
