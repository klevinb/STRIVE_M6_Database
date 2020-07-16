import React, { Component } from "react";
import {
  Container,
  Image,
  Card,
  Accordion,
  Button,
  Modal,
  Row,
  Col,
  Form,
  Spinner,
} from "react-bootstrap";
import "./StudentDetails.css";
import TableForProjects from "./TableForProjects";

const apiKey = process.env.REACT_APP_API_KEY;

class StudentDetails extends Component {
  state = {
    addProject: false,
    user: "",
    reviews: [],
    userImg: "",
    projects: [],
    searchValue: "",
    photo: "",
    showModal: false,
    newProject: {
      name: "",
      description: "",
      repourl: "",
      liveurl: "",
      studentid: this.props.match.params.id,
    },
    addReview: false,
    projectId: "",
    newReview: {
      name: "",
      text: "",
    },
  };

  searchProjects = async () => {
    let resp = await fetch(apiKey + "/projects?name=" + this.state.searchValue);
    let data = await resp.json();

    let projects = data.filter(
      (project) => project.studentId === this.props.match.params.id
    );
    this.setState({
      projects,
    });
  };

  saveImg = (e) => {
    this.setState({
      photo: e.target.files[0],
    });
  };

  getProjectPhoto = async (id) => {
    const resp = await fetch(apiKey + "/projects/" + id + "/getPhoto");
    if (resp.ok) {
      this.setState({
        photo: resp.url,
        showModal: true,
      });
    }
  };

  fetchData = async () => {
    let resp = await fetch(
      apiKey + "/students/" + this.props.match.params.id + "/projects"
    );

    if (resp.ok) {
      let projects = await resp.json();
      this.setState({
        projects,
      });
    } else {
      alert("Something went wrong!");
    }
  };

  fetchUser = async () => {
    let resp = await fetch(apiKey + "/students/" + this.props.match.params.id);
    let data = await resp.json();
    if (resp.ok) {
      this.setState({
        user: data,
        projects: data.projects,
      });
    }
    let resp2 = await fetch(
      apiKey + "/students/" + this.props.match.params.id + "/getPhoto"
    );
    let userImg = resp2.url;
    if (resp2.ok) {
      this.setState({
        userImg,
      });
    }
  };

  fetchReviews = async (id) => {
    const resp = await fetch(apiKey + "/projects/" + id + "/reviews");
    const reviews = await resp.json();
    if (resp.ok) {
      this.setState({
        reviews,
      });
    }
  };

  componentDidMount = () => {
    // this.fetchData();
    this.fetchUser();
  };

  searchQuery = (e) => {
    this.setState({
      searchValue: e.currentTarget.value,
    });
    setTimeout(() => {
      this.searchProjects();
    }, 100);
  };

  handleChange = (e) => {
    const newProject = this.state.newProject;
    newProject[e.currentTarget.id] = e.currentTarget.value;
    this.setState({
      newProject,
    });
  };

  editProject = async (id) => {
    let resp = await fetch(apiKey + "/projects/" + id);
    let data = await resp.json();
    this.setState({
      editProjectInfo: true,
      newProject: data,
      projectID: id,
    });
  };
  editProjectInfo = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("project", this.state.photo);

    let resp = await fetch(apiKey + "/projects/" + this.state.projectID, {
      method: "PUT",
      body: JSON.stringify(this.state.newProject),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resp2 = await fetch(
      apiKey + "/projects/" + this.state.projectID + "/uploadPhoto",
      {
        method: "POST",
        body: data,
      }
    );

    if (resp.ok) {
      this.setState({
        addProject: false,
        editProjectInfo: false,
        newProject: {
          name: "",
          description: "",
          repourl: "",
          liveurl: "",
          studentid: this.props.match.params.id,
        },
      });
      setTimeout(() => {
        this.fetchUser();
      }, 500);
    }
  };

  deleteProject = (id) => {
    fetch(apiKey + "/projects/" + id, {
      method: "DELETE",
    });
    setTimeout(() => {
      this.fetchUser();
    }, 500);
  };

  addProjectFunction = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("project", this.state.photo);

    let resp = await fetch(apiKey + "/projects", {
      method: "POST",
      body: JSON.stringify(this.state.newProject),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const projectId = await resp.json();

    const resp2 = await fetch(
      apiKey + "/projects/" + projectId.projectid + "/uploadPhoto",
      {
        method: "POST",
        body: data,
      }
    );
    console.log(resp);
    if (resp.ok) {
      this.setState({
        addProject: false,
        photo: "",
        newProject: {
          name: "",
          description: "",
          repourl: "",
          liveurl: "",
          studentid: this.props.match.params.id,
        },
      });
      setTimeout(() => {
        this.fetchUser();
      }, 500);
    }
  };

  getProjectId = (id) => {
    this.setState({
      projectId: id,
      addReview: true,
    });
  };

  handleReview = (e) => {
    const newReview = this.state.newReview;
    newReview[e.currentTarget.id] = e.currentTarget.value;
    this.setState({
      newReview,
    });
  };

  addNewReview = async (e) => {
    e.preventDefault();
    const resp = await fetch(
      apiKey + "/projects/" + this.state.projectId + "/reviews",
      {
        method: "POST",
        body: JSON.stringify(this.state.newReview),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (resp.ok) {
      this.fetchReviews(this.props.match.params.id);
      this.setState({
        addReview: false,
        projectId: "",
        newReview: {
          name: "",
          text: "",
        },
      });
    }
  };

  render() {
    return (
      <Container className='d-flex justify-content-center flex-column mt-5'>
        <div className='d-flex justify-content-center  mb-5'>
          <div style={{ borderRadius: "30%", overflow: "hidden" }}>
            {this.state.user && this.state.userImg ? (
              <Image
                fluid
                src={this.state.userImg}
                width='300px'
                height='300px'
              />
            ) : (
              <Image
                fluid
                src='https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg'
                width='300px'
                height='300px'
              />
            )}
          </div>
        </div>
        <div className='d-flex justify-content-center'>
          <Accordion>
            <Card>
              <Card.Header className='d-flex justify-content-center'>
                <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                  Show Projects
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey='1'>
                <>
                  <Card.Body>
                    <TableForProjects
                      projects={this.state.projects}
                      reviews={this.state.reviews}
                      getProjectId={this.getProjectId}
                      fetchReviews={this.fetchReviews}
                      getProjectPhoto={this.getProjectPhoto}
                      deleteProject={this.deleteProject}
                      editProject={this.editProject}
                      searchQuery={this.searchQuery}
                    />
                  </Card.Body>
                  <Card.Footer className='d-flex justify-content-center'>
                    <Button
                      variant='success'
                      onClick={() =>
                        this.setState({ addProject: !this.state.addProject })
                      }
                    >
                      Add Project
                    </Button>
                  </Card.Footer>
                </>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
        <Modal
          show={this.state.addProject}
          onHide={() =>
            this.setState({
              addProject: false,
              newProject: {
                name: "",
                description: "",
                repourl: "",
                liveurl: "",
                studentid: this.props.match.params.id,
              },
            })
          }
        >
          <Modal.Header closeButton>
            <Modal.Title className='text-center'>Add a new Student</Modal.Title>
          </Modal.Header>

          <Modal.Footer className='d-flex justify-content-center'>
            <Form onSubmit={this.addProjectFunction}>
              <Row>
                <Col>
                  <Form.Group controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={this.state.newProject.name}
                      onChange={this.handleChange}
                      type='text'
                      placeholder='Name of the project'
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='description'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type='text'
                      value={this.state.newProject.description}
                      onChange={this.handleChange}
                      placeholder='Description'
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group controlId='repourl'>
                    <Form.Label>Repo Link</Form.Label>
                    <Form.Control
                      value={this.state.newProject.repourl}
                      onChange={this.handleChange}
                      type='text'
                      placeholder='Link of the repo'
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='liveurl'>
                    <Form.Label>Live Link</Form.Label>
                    <Form.Control
                      type='text'
                      value={this.state.newProject.liveurl}
                      onChange={this.handleChange}
                      placeholder='Link of live repo'
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
                <Button variant='primary' type='submit'>
                  Add Project
                </Button>
              </div>
            </Form>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.editProjectInfo}
          onHide={() =>
            this.setState({
              addProject: false,
              editProjectInfo: false,
              newProject: {
                name: "",
                description: "",
                repourl: "",
                liveurl: "",
                studentid: this.props.match.params.id,
              },
            })
          }
        >
          <Modal.Header closeButton>
            <Modal.Title className='text-center'>Edit Project Info</Modal.Title>
          </Modal.Header>

          <Modal.Body className='d-flex justify-content-center'>
            <Form onSubmit={this.editProjectInfo}>
              <Row>
                <Col>
                  <Form.Group controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={this.state.newProject.name}
                      onChange={this.handleChange}
                      type='text'
                      placeholder='Name of the project'
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='description'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type='text'
                      value={this.state.newProject.description}
                      onChange={this.handleChange}
                      placeholder='Description'
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group controlId='repourl'>
                    <Form.Label>Repo Link</Form.Label>
                    <Form.Control
                      value={this.state.newProject.repourl}
                      onChange={this.handleChange}
                      type='text'
                      placeholder='Link of the repo'
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='liveurl'>
                    <Form.Label>Live Link</Form.Label>
                    <Form.Control
                      type='text'
                      value={this.state.newProject.liveurl}
                      onChange={this.handleChange}
                      placeholder='Link of live repo'
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
                <Button variant='primary' type='submit'>
                  Edit Project
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        <Modal
          show={this.state.showModal}
          onHide={() => {
            this.setState({
              showModal: false,
              photo: "",
            });
          }}
        >
          <Modal.Body className='d-flex flex-column'>
            <div className='d-flex justify-content-center'>
              <Image src={this.state.photo} fluid />
            </div>
          </Modal.Body>
        </Modal>
        <Modal
          show={this.state.addReview}
          onHide={() =>
            this.setState({
              addReview: false,
              newReview: {
                name: "",
                text: "",
              },
              projectId: "",
            })
          }
        >
          <Modal.Header>
            <Modal.Title>Add a new review</Modal.Title>
          </Modal.Header>
          <Modal.Body className='text-center'>
            <Form onSubmit={this.addNewReview}>
              <Row className='d-flex justify-content-center'>
                <Col md={6}>
                  <Form.Group controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={this.state.newReview.name}
                      onChange={this.handleReview}
                      type='text'
                      placeholder='Please write your name..'
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className='d-flex justify-content-center'>
                <Col md={8}>
                  <Form.Group controlId='text'>
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      type='text'
                      value={this.state.newReview.text}
                      onChange={this.handleReview}
                      placeholder='Leave your comment..'
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className='d-flex justify-content-center'>
                <Button variant='primary' type='submit'>
                  Send review
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    );
  }
}

export default StudentDetails;
