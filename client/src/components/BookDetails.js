import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getBookQuery} from "../queries/queries";

class BookDetails extends Component {

    displayBook(){
        //console.log(this.props);
        let data = this.props.data;
        if(data.loading) return (<span>Loading Book Details....</span>);
        if (data.error) return (<p>Error :(</p>);
        let book = data.book;
        return (
            <div>
                <h3>{book.name}</h3>
                <p>{book.genre}</p>
                <p>{book.author.name}</p>
                <p>All the books by this author</p>
                <ul className="other-books">
                    {book.author.books.map(book=>{
                        return(<li key={book.id}>{book.name}</li>);
                    })}
                </ul>
            </div>
                
        );
    }

  render() {
    return (
      <div className="BookDetails" >
        <ul id="book-details">
            {this.props.id ? 
                (<div>{this.displayBook()}</div>) :
                (<h3>Select A Book</h3> )
            }
        </ul>
      </div>
    );
  }
}

export default graphql(getBookQuery)(BookDetails);
