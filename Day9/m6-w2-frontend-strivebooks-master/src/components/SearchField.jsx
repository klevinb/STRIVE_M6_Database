import React, { Component } from 'react'
import BookListItem from './BookListItem'

class SearchField extends Component {
    state = {
        searchQuery: "",
        books: []
    }

    searchSomething = async () => {
        const res = await fetch(`http://localhost:3456/books/search/` + this.state.searchQuery)
        const books = await res.json()
        this.setState({
          books: books
        })
    }

    render() {
        return (
            <div>
                <input placeholder="Scrivi qui il tuo valore..."
                    value={this.state.searchQuery}
                    onChange={e => this.setState({searchQuery: e.currentTarget.value})}
                    />

                <button onClick={this.searchSomething}>Chiama API</button>

                {this.state.books.map(x => <BookListItem item={x} />)}
            </div>
        )
    }
}

export default SearchField
