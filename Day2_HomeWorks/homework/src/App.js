import React, { Component } from 'react';
import {
  Container,
  Accordion,
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Image
} from 'react-bootstrap'
import Table from './components/Table'
import './App.css';

class App extends Component {

  state = {
    addStudent: false,
    editStudent: false,
    postButton: true,
    showModal: false,
    students: [],
    photo: '',
    newStudent: {
      name: "",
      surname: "",
      email: "",
      date: ""
    }
  }

  fetchData = async () => {
    const response = await fetch("http://127.0.0.1:3003/students")

    if (response.ok) {
      const students = await response.json()
      this.setState({
        students
      });
    } else {
      alert("Something went wrong!")
    }
  }

  getStudentPhoto = async (id) => {
    const resp = await fetch("http://127.0.0.1:3003/students/" + id + "/getPhoto")
    if (resp.ok) {
      this.setState({
        photo: resp.url,
        showModal: true
      });
    }
  }
  saveImg = (e) => {
    this.setState({
      photo: e.target.files[0]
    });
  }

  fetchUser = async (id, name, surname) => {
    const resp = await fetch("http://127.0.0.1:3003/students/" + id + "/getPhoto")
    if (resp.ok) {
      const newStudent = this.state.newStudent
      newStudent.name = name
      newStudent.surname = surname
      this.setState({
        photo: resp.url,
        showModal: true,
        newStudent
      });
    } else {
      alert("This student doesnt have any photo on server!")
    }

  }

  componentDidMount = async () => {
    this.fetchData()
  }

  fetchStudentData = async (id) => {
    const res = await fetch("http://127.0.0.1:3003/students/" + id)
    if (res.ok) {
      const student = await res.json()
      this.setState({
        editStudent: true,
        newStudent: {
          _id: student._id,
          name: student.name,
          surname: student.surname,
          email: student.email,
          date: student.date.slice(0, 10),
          numberOfProjects: student.numberOfProjects
        },
      });
    } else {
      alert("Something went wrong!")
    }
  }

  checkEmail = async () => {
    const resp = await fetch("http://127.0.0.1:3003/students/checkEmail", {
      method: "POST",
      body: JSON.stringify(this.state.newStudent),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (resp.ok) {
      this.setState({
        postButton: true
      });
    } else {
      this.setState({
        postButton: false
      });
    }
  }

  addNewStudent = async (e) => {
    e.preventDefault()

    const data = new FormData()
    data.append("profile", this.state.photo)

    const resp = await fetch("http://127.0.0.1:3003/students", {
      method: "POST",
      body: JSON.stringify(this.state.newStudent),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const studentId = await resp.json()

    const resp2 = await fetch("http://127.0.0.1:3003/students/" + studentId._id + "/uploadPhoto", {
      method: "POST",
      body: data,
    })

    if (resp.ok) {
      this.setState({
        addStudent: false,
        adminMessage: false,
        editStudent: false,
        postButton: true,
        newStudent: {
          name: "",
          surname: "",
          email: "",
          date: ""
        },
        photo: ""
      });
    }

    this.fetchData()

  }

  editStudent = async (e) => {
    e.preventDefault()
    const resp = await fetch("http://127.0.0.1:3003/students/" + this.state.newStudent._id, {
      method: "PUT",
      body: JSON.stringify(this.state.newStudent),
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (resp.ok) {
      this.fetchData()
      this.setState({
        editStudent: false,
        newStudent: {
          name: "",
          surname: "",
          email: "",
          date: ""
        },
      });
    }

  }

  deleteStudent = async (id) => {
    const resp = await fetch("http://127.0.0.1:3003/students/" + id, {
      method: "DELETE"
    })
    if (resp.ok) {
      this.fetchData()
    } else {
      this.setState({
        adminMessage: true
      });
    }
  }


  handleChange = (e) => {
    const newStudent = this.state.newStudent
    newStudent[e.currentTarget.id] = e.currentTarget.value
    this.setState({
      newStudent
    });
    this.checkEmail()
  }


  render() {

    return (
      <div className="App">
        <Container className="d-flex justify-content-center">
          <Accordion className="mt-5">
            <Card>
              <Card.Header className="d-flex justify-content-center">
                <Accordion.Toggle as={Button} variant="link" eventKey="1">
                  Show Students
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <>
                  <Card.Body>
                    <Table
                      props={this.props}
                      fetchUser={this.fetchUser}
                      students={this.state.students}
                      getStudentPhoto={this.getStudentPhoto}
                      fetchStudentData={this.fetchStudentData}
                      deleteStudent={this.deleteStudent}
                    />
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-center">
                    <Button variant="success" onClick={() => this.setState({ addStudent: !this.state.addStudent })}>Add Student</Button>
                  </Card.Footer>
                  <Modal show={this.state.addStudent} onHide={() => this.setState({
                    addStudent: false,
                    editStudent: false,
                    postButton: true,
                    newStudent: {
                      name: "",
                      surname: "",
                      email: "",
                      date: ""
                    }
                  }

                  )}>
                    <Modal.Header closeButton>
                      <Modal.Title className="text-center">Add a new Student</Modal.Title>
                    </Modal.Header>

                    <Modal.Footer className="d-flex justify-content-center">
                      <Form onSubmit={this.addNewStudent}>
                        <Row>
                          <Col>
                            <Form.Group controlId="name">
                              <Form.Label>Name</Form.Label>
                              <Form.Control
                                value={this.state.newStudent.name}
                                onChange={this.handleChange}
                                type="text"
                                placeholder="Write your name" />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group controlId="surname">
                              <Form.Label>Surname</Form.Label>
                              <Form.Control
                                type="text"
                                value={this.state.newStudent.surname}
                                onChange={this.handleChange}
                                placeholder="Write your surname" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <Form.Group controlId="email">
                              <Form.Label>Email address</Form.Label>
                              <Form.Control
                                type="email"
                                value={this.state.newStudent.email}
                                onChange={this.handleChange}
                                placeholder="Enter email" />
                              <Form.Text className="text-muted">
                                We'll never share your email with anyone else.
                          </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group controlId="date">
                              <Form.Label>Birthday</Form.Label>
                              <Form.Control
                                value={this.state.newStudent.date}
                                onChange={this.handleChange}
                                type="date" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <input type="file"
                              name="file"
                              onChange={this.saveImg}
                              accept="image/png, image/jpeg" />
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-center mt-3">
                          {this.state.postButton ?
                            <Button
                              variant="primary"
                              type="submit"
                            >
                              POST
                            </Button>
                            :
                            <Alert variant="danger">
                              Try another email because another users is using this one!
                            </Alert>

                          }
                        </div>

                      </Form>
                    </Modal.Footer>
                  </Modal>
                  <Modal show={this.state.editStudent} onHide={() => this.setState({
                    addStudent: false,
                    editStudent: false,
                    postButton: true,
                    newStudent: {
                      name: "",
                      surname: "",
                      email: "",
                      date: ""
                    }
                  })}>
                    <Modal.Header closeButton>
                      <Modal.Title className="text-center">Edit the Student info</Modal.Title>
                    </Modal.Header>

                    <Modal.Footer className="d-flex justify-content-center">
                      <Form onSubmit={this.editStudent}>
                        <Row>
                          <Col>
                            <Form.Group controlId="name">
                              <Form.Label>Name</Form.Label>
                              <Form.Control
                                value={this.state.newStudent.name}
                                onChange={this.handleChange}
                                type="text"
                                placeholder="Write your name" />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group controlId="surname">
                              <Form.Label>Surname</Form.Label>
                              <Form.Control
                                type="text"
                                value={this.state.newStudent.surname}
                                onChange={this.handleChange}
                                placeholder="Write your surname" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <Form.Group controlId="email">
                              <Form.Label>Email address</Form.Label>
                              <Form.Control
                                type="email"
                                value={this.state.newStudent.email}
                                onChange={this.handleChange}
                                placeholder="Enter email" />
                              <Form.Text className="text-muted">
                                We'll never share your email with anyone else.
                          </Form.Text>
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group controlId="date">
                              <Form.Label>Birthday</Form.Label>
                              <Form.Control
                                value={this.state.newStudent.date}
                                onChange={this.handleChange}
                                type="date" />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-center">
                          {this.state.postButton ?
                            <Button variant="primary" type="submit">
                              EDIT
                            </Button>
                            :
                            <Alert variant="danger">
                              Try another email because another users is using this one!
                            </Alert>

                          }
                        </div>

                      </Form>
                    </Modal.Footer>
                  </Modal>
                </>
              </Accordion.Collapse>
            </Card>
          </Accordion>
          <Modal show={this.state.showModal} onHide={() => {
            this.setState({
              showModal: false,
              photo: '',
              newStudent: {
                name: "",
                surname: "",
                email: "",
                date: ""
              }
            })
          }}>
            <Modal.Body className="d-flex flex-column">
              <div className="d-flex justify-content-center">
                <Image src={this.state.photo} fluid />
              </div>
              {this.state.newStudent.name.length > 0 ?
                <div className="d-flex justify-content-center mt-3">
                  <h3>{this.state.newStudent.name + " " + this.state.newStudent.surname}</h3>
                </div>
                :
                null
              }
            </Modal.Body>
          </Modal>
          <Modal show={this.state.adminMessage} onHide={() => this.setState({ adminMessage: false })}>
            <Modal.Body>
              <Image
                src="https://lh3.googleusercontent.com/proxy/WYXMxbth2pjeU1wqWHQle4s8mDe0Bu3Qe4naB9UEqQnGVpacPW1rObhbqo1zHtZnHJfYYccWQKqTIt3fDVIHFe67_QahV1tMjvqD8D7iGhYPg4uJxbzO3BqEEaTdnCJMItSMeRmy9hTYfUZebsm0w81VlISzR5B0LT8"
                fluid
                width="100%" />
            </Modal.Body>
          </Modal>
        </Container>
      </div >
    );
  }
}

export default App;
