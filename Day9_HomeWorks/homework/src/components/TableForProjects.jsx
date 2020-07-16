import React from "react";
import {
  Button,
  Table,
  FormControl,
  Alert,
  Accordion,
  Card,
  ListGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";

function Table1(props) {
  return (
    <>
      <div className='d-flex justify-content-center mb-4'>
        <FormControl
          type='text'
          style={{ width: "200px" }}
          onChange={props.searchQuery}
          placeholder='Search'
          className='mr-sm-2'
        />
      </div>
      {props.projects.length > 0 ? (
        <Table className='text-center' striped bordered hover variant='dark'>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Reviews</th>
              <th>RepoURL</th>
              <th>LiveURL</th>
              <th colSpan='2'>Options</th>
            </tr>
          </thead>
          <tbody>
            {props.projects.map((project, i) => (
              <tr key={project.projectid}>
                <td>{i + 1}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td className='d-flex'>
                  <Button
                    onClick={() => props.getProjectPhoto(project.projectid)}
                    variant='warning'
                    className='mr-3'
                  >
                    View
                  </Button>
                  <Button variant='info'>
                    <a
                      style={{ color: "white" }}
                      href={
                        "http://127.0.0.1:3003/projects/" +
                        project._id +
                        "/download"
                      }
                    >
                      Download
                    </a>
                  </Button>
                </td>
                <td>
                  {project.studentId !== "admin" ? (
                    <div style={{ width: "250px" }} className='mb-4'>
                      <Button
                        onClick={() => {
                          props.getProjectId(project.projectid);
                        }}
                      >
                        Write a review
                      </Button>
                    </div>
                  ) : null}
                  {props.reviews && (
                    <Accordion style={{ width: "250px" }} defaultActiveKey='0'>
                      <Card>
                        <Card.Header>
                          <Accordion.Toggle
                            onClick={() =>
                              props.fetchReviews(project.projectid)
                            }
                            as={Button}
                            variant='link'
                            eventKey='1'
                          >
                            Show Reviews
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey='1'>
                          <Card.Body>
                            <ListGroup style={{ color: "black" }}>
                              {props.reviews.length > 0 ? (
                                props.reviews.map((review) => (
                                  <ListGroup.Item>
                                    {review.name} : {review.text}
                                  </ListGroup.Item>
                                ))
                              ) : (
                                <Alert variant='info'>
                                  No reviews for this project
                                </Alert>
                              )}
                            </ListGroup>
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                  )}
                </td>
                <td>
                  <Link to={"https://" + project.repoUrl}>
                    {project.repoUrl}
                  </Link>
                </td>
                <td>
                  <Link to={"https://" + project.liveUrl}>
                    {project.liveUrl}
                  </Link>
                </td>
                <td>
                  <Button
                    variant='warning'
                    onClick={() => props.editProject(project.projectid)}
                  >
                    Edit
                  </Button>
                </td>
                <td>
                  <Button
                    variant='danger'
                    onClick={() => props.deleteProject(project.projectid)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant='info'>No projects for this user</Alert>
      )}
    </>
  );
}

export default Table1;
