import React, { Component } from 'react';
import {gql} from 'apollo-boost';
import {graphql} from 'react-apollo';

import { Query } from "react-apollo";

const getAuthorsQuery = gql`{
    authors{
        name
        id
    }
}`


class AuthorList extends Component {
  render() {
    return (
      <div className="AuthorList" >
        <ul id="author-list">
            <h3>Authors</h3>
             <Query query={getAuthorsQuery} >
                {({ loading, error, data }) => {
                if (loading) return <p>Loading Authors...</p>;
                if (error) return <p>Error :(</p>;
                return data.authors.map(({ name, id }) => (
                    <li key={id}>
                    {`${name}: ${id}`}
                    </li>
                ));
                }}
             </Query>
        </ul>
      </div>
    );
  }
}

export default AuthorList;
