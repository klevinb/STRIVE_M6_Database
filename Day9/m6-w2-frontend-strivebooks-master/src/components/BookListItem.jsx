import React, { Component } from 'react'
import { Col, Image, Button, Card} from "react-bootstrap"

class BookListItem extends Component {
    addToCard = async () => {
        const resp = await fetch("http://localhost:3456/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    bookid: this.props.item.asin,
                    userid: 1
                }
            )
        })
        if (resp.ok)
            this.props.onBookAddedToCart(this.props.item.asin)
        else 
            alert("something went wrong!!")
    }

    render() {
        const { asin, title, img, price, category} = this.props.item
        return (
            <Col md={4}>
                <Card >
                <Card.Img variant="top" src={img} onClick={() => this.props.onImageClicked(title)} />
                <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                    {category} - € {price}
                    </Card.Text>
                    <Button variant="primary" onClick={this.addToCard}>Add to Cart</Button>
                </Card.Body>
                </Card>
            </Col>
        )
    }
}

export default BookListItem
