import React from 'react';
import { Table, Button } from 'react-bootstrap'

function Table1(props) {
    return (
        <Table className="text-center" striped bordered hover variant="dark">
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
                            <Button onClick={() => props.getStudentPhoto(student.id)} variant="warning" className="mr-3">View</Button>
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
        </Table>
    );
}

export default Table1;