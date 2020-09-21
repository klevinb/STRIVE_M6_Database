import React, { Component } from 'react';
import '../App.css';
import {
  Container,
  Row,
  Col,
  NavDropdown,
  Navbar,
  Nav,
  Card,
  Pagination,
  Modal,
  Button,
  Alert,
} from 'react-bootstrap';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const apiKey = process.env.REACT_APP_API_URL;

class App extends Component {
  state = {
    products: [],
    limit: 8,
    offset: 0,
    items: [],
    nrOfProducts: '',
    category: '',
    showCart: false,
    cart: [],
    total: '',
  };

  fetchProducts = async (category, offset) => {
    const resp = await fetch(
      apiKey +
        '/products?category=' +
        category +
        `&limit=${this.state.limit}&offset=${this.state.offset}`
    );

    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        products: data.products,
        nrOfProducts: data.nrOfProducts,
      });
    }
  };

  getUserInfo = async () => {
    const getUserInfo = await fetch(apiKey + '/users/5f086c7ad968173410b95179');
    if (getUserInfo.ok) {
      const data = await getUserInfo.json();
      this.setState({
        cart: data.products,
      });
    }
  };

  addToCart = async (id) => {
    const resp = await fetch(apiKey + '/products/' + id);
    const productInfo = await resp.json();
    const addToCart = await fetch(
      apiKey + '/users/5f086c7ad968173410b95179/add-product-to-cart/' + id,
      {
        method: 'POST',
        body: JSON.stringify(productInfo),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const getUserInfo = await fetch(apiKey + '/users/5f086c7ad968173410b95179');
    if (getUserInfo.ok) {
      const data = await getUserInfo.json();
      const products = data.products;
      this.setState({
        cart: products,
      });
    }
  };

  pagination = () => {
    let roundNr;

    if (this.state.nrOfProducts % this.state.limit === 0) {
      roundNr = Math.floor(this.state.nrOfProducts / this.state.limit);
    } else {
      roundNr = Math.floor(this.state.nrOfProducts / this.state.limit) + 1;
    }
    let items = [];
    for (let number = 1; number <= roundNr; number++) {
      items.push(
        <Pagination.Item
          onClick={() =>
            this.setState({
              offset: this.state.limit * (number - 1),
            })
          }
        >
          {number}
        </Pagination.Item>
      );
    }
    this.setState({
      items,
    });
  };

  calculateTotal = async () => {
    const resp = await fetch(
      apiKey + '/users/5f086c7ad968173410b95179/calculateTotal'
    );
    if (resp.ok) {
      const result = await resp.json();
      this.setState({
        total: result.total,
      });
    }
  };

  fetchCategory = async (category) => {
    this.setState({
      products: [],
    });
    const resp = await fetch(
      apiKey +
        '/products?category=' +
        category +
        `&limit=${this.state.limit}&offset=${this.state.offset}`
    );

    if (resp.ok) {
      const data = await resp.json();
      this.setState({
        products: data.products,
        nrOfProducts: data.nrOfProducts,
      });
    }
  };

  componentDidMount() {
    this.fetchProducts(this.state.category, this.state.offset);
    this.getUserInfo();
    this.calculateTotal();
  }
  changePage = (id) => {
    this.props.history.push('/productDetails/' + id);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevState.offset !== this.state.offset ||
      prevState.category !== this.state.category
    ) {
      this.fetchProducts(this.state.category, this.state.offset);
    } else if (prevState.nrOfProducts !== this.state.nrOfProducts) {
      this.pagination();
    } else if (prevState.cart !== this.state.cart) {
      this.calculateTotal();
    }
  };

  render() {
    return (
      <div className='App'>
        <Navbar bg='light' expand='lg'>
          <Navbar.Brand
            onClick={() => this.setState({ offset: 0, category: '' })}
          >
            Oiii SHOP
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='mr-auto'>
              <Nav.Link
                onClick={() => this.setState({ offset: 0, category: '' })}
              >
                {' '}
                Home
              </Nav.Link>
              <NavDropdown title='Categories' id='basic-nav-dropdown'>
                <NavDropdown.Item
                  onClick={() => this.setState({ category: 'smartphones' })}
                >
                  Smarphones
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => this.setState({ category: 'watches' })}
                >
                  Watches
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => this.setState({ category: 'bikes' })}
                >
                  Bikes
                </NavDropdown.Item>
              </NavDropdown>
              <Link className='nav-link' to={'/backoffice'}>
                BackOffice
              </Link>
              <NavDropdown title='Options' id='basic-nav-dropdown'>
                <NavDropdown.Item
                  href={apiKey + '/products/convert/exportToCSV'}
                >
                  Products(CSV)
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Container className='mt-4'>
          <div
            style={{
              position: 'absolute',
              top: '10%',
              right: '5%',
              fontSize: '30px',
              zIndex: '99',
            }}
            onClick={() => this.setState({ showCart: true })}
          >
            {this.state.cart.length > 0 ? (
              <FaShoppingCart />
            ) : (
              <AiOutlineShoppingCart />
            )}
          </div>
          <Row sm={3} md={4}>
            {this.state.products.length > 0 &&
              this.state.products.map((product) => (
                <Col key={product._id} sm={6} md={4}>
                  <Card
                    style={{ width: '15rem', border: '0px' }}
                    className='mb-2'
                  >
                    <Card.Img
                      onClick={() => this.changePage(product._id)}
                      variant='top'
                      src={product.imageUrl}
                      height='250px'
                    />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <label>Brand: {product.brand}</label>
                      <label>Category: {product.category}</label>
                      <Card.Text>{product.description}</Card.Text>
                      <label>Price: {product.price} $</label>
                      <br></br>
                      <Button
                        variant='info'
                        onClick={() => this.addToCart(product._id)}
                      >
                        Buy
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
          <div className='d-flex justify-content-center'>
            <Pagination>{this.state.items.map((item) => item)}</Pagination>
          </div>
          <Modal
            show={this.state.showCart}
            onHide={() => this.setState({ showCart: false })}
          >
            <Modal.Header>
              <h1>Cart</h1>
            </Modal.Header>
            <Modal.Body>
              {this.state.cart.length > 0 ? (
                this.state.cart.map((item) => (
                  <div className='d-flex justify-content-between text-center'>
                    <div>
                      Name:<br></br> {item.name}
                    </div>
                    <div>
                      Quantity:<br></br> {item.quantity}
                    </div>
                    <div>
                      Price:<br></br> {item.price} $
                    </div>
                  </div>
                ))
              ) : (
                <Alert variant='danger'>No products on cart!</Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <div className='d-flex justify-content-end'>
                <div>Total: {this.state.total} $</div>
              </div>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    );
  }
}

export default App;
