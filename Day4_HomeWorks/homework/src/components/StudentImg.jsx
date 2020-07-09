import React from 'react';
import { Card } from 'react-bootstrap'

class StudentImg extends React.Component {

    state = {
        imgUrl: ""
    }

    getStudentPhoto = async () => {
        const resp = await fetch("http://127.0.0.1:3003/students/" + this.props.id + "/getPhoto")
        if (resp.ok) {
            this.setState({
                imgUrl: resp.url,
            });
        }
    }

    componentDidMount = () => {
        this.getStudentPhoto()
    }

    render() {
        return (
            <>
                {this.state.imgUrl ?
                    <Card.Img
                        src={this.state.imgUrl}
                        style={{
                            width: "150px",
                            height: "150px",
                            alignSelf: "center",
                            borderRadius: "50%"
                        }}
                        onClick={() => this.props.goToProjectPage(this.props.id)}
                    />
                    :
                    <Card.Img
                        src="https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg"
                        style={{ width: "150px", alignSelf: "center" }}
                        onClick={() => this.props.goToProjectPage(this.props.id)}
                    />
                }
            </>
        )
    }


}


export default StudentImg;