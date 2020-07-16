import React from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './components/Navigation';
import BookList from "./components/BookList"
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Cart from "./components/Cart"
import { Button, Row } from 'react-bootstrap';
import { DashCircleFill, PlusCircleFill } from "react-bootstrap-icons"
import SearchField from './components/SearchField';



class App extends React.Component {

  state = {
    books: [],
    cart: [],
    page: 0,
    pageSize: 12,
    searchQuery: "",
    navigationTitle: "Strive Library"
  }

  setPage = async (page) => {
    this.setState({
      page: page
    }, async () => {
      await this.fetchData()
    })
  }

  handleBookAddedToCartOnline = async () => {
    await this.fetchCart()
  }

  handleBookAddedToCard = async (asin) => {
    const element = this.state.cart.find(book => book.asin === asin)
    if (element){ 
      element.quantity ++
      element.total = element.quantity * element.unitary_price
      this.setState({
        cart: this.state.cart
      })
    }
    else{
      const book = this.state.books.find(book => book.asin === asin)
      this.setState({
        cart: [...this.state.cart, {
          asin: book.asin,
          title: book.title,
          img: book.img,
          category: book.category,
          unitary_price: book.price,
          quantity: 1,
          total: book.price
        }]
      })
    }
  }

  handleBookRemovedFromCartOnline = async () =>{
    await this.fetchCart()
  }

  handleBookRemovedFromCart = async (asin) => {
    const element = this.state.cart.find(book => book.asin === asin)
    if (element.quantity > 1){
      element.quantity --
      element.total = element.quantity * element.unitary_price
      this.setState({
        cart: this.state.cart
      })
    }
    else{
      this.setState({
        cart: this.state.cart.filter(x => x.asin !== asin)
      })
    }
  }

  render() {
    return (
      <Router>
        <Navigation 
          title={this.state.navigationTitle}
          cart={this.state.cart}
          query={this.state.searchQuery}
          onSeachQueryUpdated={(value) => this.setState({ searchQuery: value })}
          onSearchClicked={this.fetchData}
        />
        {/* <SearchField /> */}

        <Switch>
          <Route path="/" exact >
            <Row className="my-4 justify-content-center">
              {this.state.page > 0 && <Button variant="success" onClick={() => this.setPage(this.state.page-1)}><DashCircleFill /></Button>}
              <Button variant="success"  onClick={() => this.setPage(this.state.page + 1)}><PlusCircleFill /></Button>
            </Row>
            <BookList
             onImageClicked={(newValue) => this.setState({navigationTitle: newValue})}
             onBookAddedToCart={this.handleBookAddedToCard}
             books={this.state.books} />
          </Route>
          <Route path="/cart" exact >
            <Cart 
            onBookRemovedFromCart={this.handleBookRemovedFromCart}
            cart={this.state.cart} />
          </Route>
        </Switch>
      </Router>
    );
  }

  fetchData = async () => {
    if (this.state.searchQuery.length > 0){
      const res = await fetch(`http://localhost:3456/books/search/${this.state.searchQuery}?limit=${this.state.pageSize}&offset=${this.state.page * this.state.pageSize}`)
      const books = await res.json()
      this.setState({
        books: books
      })
    }
    else {
      const res = await fetch(`http://localhost:3456/books?limit=${this.state.pageSize}&offset=${this.state.page * this.state.pageSize}`)
      const books = await res.json()
      this.setState({
        books: books
      })
    }
    
  }

  fetchCart = async () => {
    const res = await fetch(`http://localhost:3456/cart/1`)
    const books = await res.json()
    this.setState({
      cart: books
    })
  }

  componentDidMount = async () => {
    await this.fetchData()
    await this.fetchCart()
  }
}

export default App;
