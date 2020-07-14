import React, { Component } from "react";
import {
  Container,
  Accordion,
  Pagination,
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Image,
} from "react-bootstrap";
import StudentInfo from "./components/StudentInfo";
import "./App.css";

const apiKey = process.env.REACT_APP_API_KEY;

class App extends Component {
  state = {
    addStudent: false,
    editStudent: false,
    postButton: true,
    showModal: false,
    students: [],
    limit: 6,
    offset: 0,
    items: [],
    nrOfStudents: "",
    photo: "",
    newStudent: {
      name: "",
      surname: "",
      email: "",
      birthday: "",
    },
  };

  fetchData = async (limit, offset) => {
    const response = await fetch(
      apiKey + "/students?limit=" + limit + "&offset=" + offset
    );

    if (response.ok) {
      const studentsData = await response.json();
      this.setState({
        students: studentsData,
        nrOfStudents: studentsData.nrOfStudents,
      });
    } else {
      alert("Something went wrong!");
    }
  };

  saveImg = (e) => {
    this.setState({
      photo: e.target.files[0],
    });
  };

  fetchUser = async (id, name, surname) => {
    const resp = await fetch(apiKey + "/students/" + id + "/getPhoto");
    if (resp.ok) {
      const newStudent = this.state.newStudent;
      newStudent.name = name;
      newStudent.surname = surname;
      this.setState({
        photo: resp.url,
        showModal: true,
        newStudent,
      });
    } else {
      alert("This student doesnt have any photo on server!");
    }
  };

  pagination = () => {
    let items = [];
    let roundNr;

    if (this.state.nrOfStudents % this.state.limit === 0) {
      roundNr = Math.floor(this.state.nrOfStudents / this.state.limit);
    } else {
      roundNr = Math.floor(this.state.nrOfStudents / this.state.limit) + 1;
    }

    for (let number = 1; number <= roundNr; number++) {
      items.push(
        <Pagination.Item
          key={number}
          onClick={(e) =>
            this.setState({
              offset: this.state.limit * (number - 1),
              selectedPage: number,
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

  componentDidMount = async () => {
    this.fetchData(this.state.limit, this.state.offset);
  };

  fetchStudentData = async (id) => {
    const res = await fetch(apiKey + "/students/" + id);
    if (res.ok) {
      const student = await res.json();
      this.setState({
        editStudent: true,
        newStudent: {
          studentid: student.studentid,
          name: student.name,
          surname: student.surname,
          email: student.email,
          birthday: student.birthday.slice(0, 10),
          numberOfProjects: student.numberOfProjects,
        },
      });
    } else {
      alert("Something went wrong!");
    }
  };

  checkEmail = async () => {
    const resp = await fetch(apiKey + "/students/checkEmail", {
      method: "POST",
      body: JSON.stringify(this.state.newStudent),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resp.ok) {
      this.setState({
        postButton: true,
      });
    } else {
      this.setState({
        postButton: false,
      });
    }
  };

  addNewStudent = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("profile", this.state.photo);

    const resp = await fetch(apiKey + "/students", {
      method: "POST",
      body: JSON.stringify(this.state.newStudent),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const studentId = await resp.json();

    const resp2 = await fetch(
      apiKey + "/students/" + studentId.studentid + "/uploadPhoto",
      {
        method: "POST",
        body: data,
      }
    );

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
          birthday: "",
        },
        photo: "",
      });
    }

    this.fetchData(this.state.limit, this.state.offset);
  };

  editStudent = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("profile", this.state.photo);

    const resp = await fetch(
      apiKey + "/students/" + this.state.newStudent.studentid,
      {
        method: "PUT",
        body: JSON.stringify(this.state.newStudent),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const resp2 = await fetch(
      apiKey + "/students/" + this.state.newStudent.studentid + "/uploadPhoto",
      {
        method: "POST",
        body: data,
      }
    );
    if (resp.ok) {
      this.fetchData(this.state.limit, this.state.offset);
      this.setState({
        editStudent: false,
        newStudent: {
          name: "",
          surname: "",
          email: "",
          birthday: "",
        },
      });
    }
  };

  deleteStudent = async (id) => {
    const resp = await fetch(apiKey + "/students/" + id, {
      method: "DELETE",
    });
    if (resp.ok) {
      this.fetchData(this.state.limit, this.state.offset);
    }
  };

  handleChange = (e) => {
    const newStudent = this.state.newStudent;
    newStudent[e.currentTarget.id] = e.currentTarget.value;
    this.setState({
      newStudent,
    });
    this.checkEmail();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.offset !== this.state.offset) {
      this.fetchData(this.state.limit, this.state.offset);
    } else if (prevState.nrOfStudents !== this.state.nrOfStudents) {
      this.pagination();
    }
  };

  render() {
    return (
      <div className='App'>
        <Container className='d-flex justify-content-center mt-5'>
          <div className='d-flex flex-column'>
            <Row
              xs={1}
              sm={2}
              md={3}
              className='d-flex justify-content-between'
            >
              <StudentInfo
                props={this.props}
                fetchUser={this.fetchUser}
                students={this.state.students}
                getStudentPhoto={this.getStudentPhoto}
                fetchStudentData={this.fetchStudentData}
                deleteStudent={this.deleteStudent}
              />
            </Row>
            <div className='d-flex justify-content-center'>
              <Pagination>
                {this.state.items.map((item, index) => (
                  <>
                    <div key={index}>{item}</div>
                  </>
                ))}
              </Pagination>
            </div>
            <div
              style={{
                position: "absolute",
                top: "5%",
                right: "5%",
              }}
            >
              <Button
                variant='success'
                onClick={() =>
                  this.setState({ addStudent: !this.state.addStudent })
                }
              >
                Add Student
              </Button>
            </div>
          </div>

          <Modal
            show={this.state.addStudent}
            onHide={() =>
              this.setState({
                addStudent: false,
                editStudent: false,
                postButton: true,
                newStudent: {
                  name: "",
                  surname: "",
                  email: "",
                  birthday: "",
                },
              })
            }
          >
            <Modal.Header closeButton>
              <Modal.Title className='text-center'>
                Add a new Student
              </Modal.Title>
            </Modal.Header>

            <Modal.Footer className='d-flex justify-content-center'>
              <Form onSubmit={this.addNewStudent}>
                <Row>
                  <Col>
                    <Form.Group controlId='name'>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={this.state.newStudent.name}
                        onChange={this.handleChange}
                        type='text'
                        placeholder='Write your name'
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId='surname'>
                      <Form.Label>Surname</Form.Label>
                      <Form.Control
                        type='text'
                        value={this.state.newStudent.surname}
                        onChange={this.handleChange}
                        placeholder='Write your surname'
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group controlId='email'>
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type='email'
                        value={this.state.newStudent.email}
                        onChange={this.handleChange}
                        placeholder='Enter email'
                      />
                      <Form.Text className='text-muted'>
                        We'll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId='birthday'>
                      <Form.Label>Birthday</Form.Label>
                      <Form.Control
                        value={this.state.newStudent.birthday}
                        onChange={this.handleChange}
                        type='date'
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <input
                      type='file'
                      name='file'
                      onChange={this.saveImg}
                      accept='image/png, image/jpeg'
                    />
                  </Col>
                </Row>

                <div className='d-flex justify-content-center mt-3'>
                  {this.state.postButton ? (
                    <Button variant='primary' type='submit'>
                      POST
                    </Button>
                  ) : (
                    <Alert variant='danger'>
                      Try another email because another user is using this one!
                    </Alert>
                  )}
                </div>
              </Form>
            </Modal.Footer>
          </Modal>
          <Modal
            show={this.state.editStudent}
            onHide={() =>
              this.setState({
                addStudent: false,
                editStudent: false,
                postButton: true,
                newStudent: {
                  name: "",
                  surname: "",
                  email: "",
                  birthday: "",
                },
              })
            }
          >
            <Modal.Header closeButton>
              <Modal.Title className='text-center'>
                Edit the Student info
              </Modal.Title>
            </Modal.Header>

            <Modal.Footer className='d-flex justify-content-center'>
              <Form onSubmit={this.editStudent}>
                <Row>
                  <Col>
                    <Form.Group controlId='name'>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={this.state.newStudent.name}
                        onChange={this.handleChange}
                        type='text'
                        placeholder='Write your name'
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId='surname'>
                      <Form.Label>Surname</Form.Label>
                      <Form.Control
                        type='text'
                        value={this.state.newStudent.surname}
                        onChange={this.handleChange}
                        placeholder='Write your surname'
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group controlId='email'>
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type='email'
                        value={this.state.newStudent.email}
                        onChange={this.handleChange}
                        placeholder='Enter email'
                      />
                      <Form.Text className='text-muted'>
                        We'll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId='birthday'>
                      <Form.Label>Birthday</Form.Label>
                      <Form.Control
                        value={this.state.newStudent.birthday}
                        onChange={this.handleChange}
                        type='date'
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <input
                      type='file'
                      name='file'
                      onChange={this.saveImg}
                      accept='image/png, image/jpeg'
                    />
                  </Col>
                </Row>

                <div className='d-flex justify-content-center'>
                  {this.state.postButton ? (
                    <Button variant='primary' type='submit'>
                      EDIT
                    </Button>
                  ) : (
                    <Alert variant='danger'>
                      Try another email because another users is using this one!
                    </Alert>
                  )}
                </div>
              </Form>
            </Modal.Footer>
          </Modal>

          <Modal
            show={this.state.showModal}
            onHide={() => {
              this.setState({
                showModal: false,
                photo: "",
                newStudent: {
                  name: "",
                  surname: "",
                  email: "",
                  birthday: "",
                },
              });
            }}
          >
            <Modal.Body className='d-flex flex-column'>
              <div className='d-flex justify-content-center'>
                <Image src={this.state.photo} fluid />
              </div>
              {this.state.newStudent.name.length > 0 ? (
                <div className='d-flex justify-content-center mt-3'>
                  <h3>
                    {this.state.newStudent.name +
                      " " +
                      this.state.newStudent.surname}
                  </h3>
                </div>
              ) : null}
            </Modal.Body>
          </Modal>
          <Modal
            show={this.state.adminMessage}
            onHide={() => this.setState({ adminMessage: false })}
          >
            <Modal.Body>
              <Image
                src='https://lh3.googleusercontent.com/proxy/WYXMxbth2pjeU1wqWHQle4s8mDe0Bu3Qe4naB9UEqQnGVpacPW1rObhbqo1zHtZnHJfYYccWQKqTIt3fDVIHFe67_QahV1tMjvqD8D7iGhYPg4uJxbzO3BqEEaTdnCJMItSMeRmy9hTYfUZebsm0w81VlISzR5B0LT8'
                fluid
                width='100%'
              />
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    );
  }
}

export default App;
