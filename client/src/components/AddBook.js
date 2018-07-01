import React, { Component } from 'react';
import {graphql, compose} from 'react-apollo';
import {getAuthorsQuery, addBookMutation, getBooksQuery} from "../queries/queries";


class AddBook extends Component {

    constructor(props){
        super(props);
        this.state = {
            name:'',
            genre:'',
            authorid:''
        }
    }

    displayAuthors(){
        let data = this.props.getAuthorsQuery;
        if(data.loading) return (<option disabled>Loading Authors....</option>);
        if (data.error) return (<option disabled>Error :(</option>);
        return data.authors.map(author=> {
            return(
                <option key={author.id} value={author.id}>{author.name}</option>
            )
        });
    }

    submitForm(e){
        e.preventDefault();
       // console.log(this.name.value);
        if(!this.name.value || !this.genre.value || !this.authorid.value || this.authorid.value==="Select author") return false;
       this.setState({name:this.name.value, genre: this.genre.value, authorid:this.authorid.value}, ()=>console.log("State updated with details"));
       this.props.addBookMutation({
           variables: {
               name: this.name.value,
               genre: this.genre.value,
               authorid:this.authorid.value
           },
           refetchQueries: [{query: getBooksQuery}]
       });
        e.target.reset();
    }

  render() {
    return (
      <div className="AddBook" >
        <form id="add-book" onSubmit={this.submitForm.bind(this)}>
                <div className="field">
                    <label>Book name:</label>
                    <input type="text" ref={(name)=> this.name=name} />
                </div>
                <div className="field">
                    <label>Genre:</label>
                    <input type="text" ref={(genre)=> this.genre=genre} />
                </div>
                <div className="field">
                    <label>Author:</label>
                    <select ref={(authorid)=> this.authorid=authorid}>
                        <option>Select author</option>
                        { this.displayAuthors() }
                    </select>
                </div>
                <button>+</button>
            </form>
      </div>
    );
  }
}

export default compose(
    graphql(getAuthorsQuery, {name:"getAuthorsQuery"}),
    graphql(addBookMutation, {name:"addBookMutation"})
)(AddBook);
