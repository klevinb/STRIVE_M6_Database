import React, { Component } from 'react'
import { Container, Row } from "react-bootstrap"
import BookListItem from './BookListItem'

class BookList extends Component {
    render() {
        return (
            <Container className="my-5">
                <Row>
                    {this.props.books.slice(0,30).map(x => <BookListItem
                         onImageClicked={this.props.onImageClicked}
                         onBookAddedToCart={this.props.onBookAddedToCart}
                         key={x.asin} item={x} />)}
                </Row>
            </Container>
        )
    }
}

export default BookList
