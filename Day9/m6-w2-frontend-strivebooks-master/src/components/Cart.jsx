import React, { Component } from 'react'
import CartItem from "./CartItem"
import { Container, Row } from 'react-bootstrap'

class Cart extends Component {
    render() {
        console.log(this.props.cart.reduce((tot, item) => tot + parseFloat(item.total), 0))

        return (
            <Container className="my-5">
                <h2>Total: € {Math.round(this.props.cart.reduce((tot, item) => tot + parseFloat(item.total), 0))}</h2>
                {this.props.cart.map(book => 
                        <CartItem
                        key={book.asin}
                        onBookRemovedFromCart={this.props.onBookRemovedFromCart}
                        item={book} />)}
            </Container>
        )
    }
}

export default Cart
