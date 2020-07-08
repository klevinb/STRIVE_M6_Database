import React from 'react';
import { Table, Button, Card, Col } from 'react-bootstrap'

function Table1(props) {
    return (
        <>
            {props.students.map(student =>
                <Col key={student._id} className="mb-3">
                    <Card style={{
                        width: '18rem',
                        display: "flex",
                        background: "transparent",
                        border: "0px",
                        textAlign: "center"
                    }}>
                        <Card.Img
                            src="https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg"
                            style={{ width: "150px", alignSelf: "center" }}
                        />
                        <Card.Body>
                            <Card.Title>{student.name} {student.surname}</Card.Title>
                            <Card.Text>
                                {student.email}
                            </Card.Text>
                            <div className="d-flex justify-content-between">
                                <Button variant="info">Contact</Button>
                                <Button variant="danger" onClick={() =>
                                    props.deleteStudent(student._id)
                                } >Delete</Button>
                                <Button variant="warning" onClick={() =>
                                    props.fetchStudentData(student._id)
                                } >Edit</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            )}
            {/* <Table className="text-center" striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                        <th>Image</th>
                        <th>Birthday</th>
                        <th colSpan="2">Options</th>
                    </tr>
                </thead>
                <tbody>
                    {props.students.map((student, i) =>
                        <tr key={student._id}>
                            <td>{i + 1}</td>
                            <td onClick={() => props.fetchUser(student.id, student.name, student.surname)}>{student.name}</td>
                            <td>{student.surname}</td>
                            <td>{student.email}</td>
                            <td className="d-flex">
                                <Button onClick={() => props.getStudentPhoto(student._id)} variant="warning" className="mr-3">View</Button>
                                <Button variant={"info"}>
                                    <a style={{ color: "white" }} href={"http://127.0.0.1:3003/students/" + student._id + "/download"}>Download</a>
                                </Button>
                            </td>
                            <td>{student.date.slice(0, 10)}</td>
                            <td><Button variant="warning" onClick={() =>
                                props.fetchStudentData(student._id)
                            } >Edit</Button></td>
                            <td><Button variant="danger" onClick={() =>
                                props.deleteStudent(student._id)
                            } >Delete</Button></td>
                            <td><Button variant="info" onClick={() => props.props.history.push("/student/" + student._id)}  >View Projects</Button></td>
                        </tr>
                    )}

                </tbody>
            </Table> */}
        </>
    );
}

export default Table1;