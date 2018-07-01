import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getBooksQuery} from '../queries/queries';
//import {BookDetails} from './BookDetails';
import BookDetails from './BookDetails';

class BookList extends Component {

    constructor(props){
        super(props);
        this.state = { selected: null, bookid:null};
    }

    displayBooks(){
        let data = this.props.data;
        if(data.loading) return (<span>Loading Books....</span>);
        if (data.error) return (<p>Error :(</p>);
        return data.books.map(book=> {
            return(
                <li key={book.id} onClick={(e)=>this.showBookDetail.bind(this)(book.id)}>{book.name}</li>
            )
        });
    }

    showBookDetail(id){
        return (this.setState({bookid: id}));
    }

    showDefaultBook(){       
        return this.props.data.books[0].id ?  (<BookDetails id={this.props.data.books[0].id} />) : '';
    }

  render() {
    return (
      <div className="BookList" >
        <ul id="book-list">
            {this.displayBooks()}
        </ul>
       { (this.state.bookid ) ? (
            <BookDetails id={this.state.bookid}/>) : 
                (!this.props.data.loading ? 
                    (this.showDefaultBook.bind(this)())   :  ''
                )
        }       
      </div>
    );
  }
}

export default graphql(getBooksQuery)(BookList);
