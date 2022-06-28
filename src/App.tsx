import React from 'react';
import plus from './plus.svg'
import './App.css';
import {Button, Card, Col, Container, Form, OverlayTrigger, Row, Tooltip} from "react-bootstrap";

const baseURL = "http://192.168.2.32:8000"

const sampleImages = [
    "https://robohash.org/sfgsdfg?size=1000x1000"
]

const addYourOwnTooltip = (props: any) => (
    <Tooltip {...props}>
        Upload your own
    </Tooltip>
);

class App extends React.Component {
    state = {
        imageOptions: [...sampleImages],
        isRequestInFlight: false,
        selectedImage: 0,
        textTask: "What does the image describe?",
    }

    select = (imageID: number) => {
        this.setState({
            selectedImage: imageID
        })
    }

    addImageOptions = (event: any) => {
        const files: File[] = Array.from(event.target.files)
        const urls = files.map(
            (f: File) => URL.createObjectURL(f)
        )

        this.setState(
            (state: any, props) => ({
                imageOptions: [...state.imageOptions, ...urls]
            })
        )
    }

    performRequest = () => {
        fetch(this.state.imageOptions[this.state.selectedImage])
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(blob => {
                const data = new FormData()
                data.append('file', blob)
                data.append('question', this.state.textTask)

                fetch(baseURL + '/process_image', {
                    method: 'POST',
                    body: data
                })
            });
    }

    render() {
        return (
            <Container id="main-container" fluid="sm">
                <Row className={"mb-4"}>
                    <Col>
                        <h2>Explainable OFA</h2>
                    </Col>
                </Row>
                <Row>
                    <Col sm className={"mb-5"}>
                        <h4>Input</h4>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Select an image
                                </Form.Label>
                                <Container className={"p-0 mb-2 preview-container styled-scrollbars"}>
                                    <Row>
                                        <Col>
                                            {
                                                this.state.imageOptions.map(
                                                    (value, index, array) => {
                                                        let classes = ["image-preview"]
                                                        if (index === this.state.selectedImage) {
                                                            classes.push("current-selection")
                                                        }

                                                        return <Card className={classes.join(" ")} bg={"dark"}
                                                                     onClick={() => this.select(index)} key={index}>
                                                            <Card.Img src={value} style={{color: "white"}}/>
                                                        </Card>
                                                    }
                                                )
                                            }
                                            <input type="file" id="file-input" accept="image/png, image/jpeg" multiple
                                                   onChange={this.addImageOptions}/>
                                            <label htmlFor="file-input">
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{show: 50, hide: 50}}
                                                    overlay={addYourOwnTooltip}
                                                >
                                                    <Card className={"image-preview"} bg={"dark"}
                                                          style={{marginRight: 0}}>
                                                        <Card.Img src={plus}/>
                                                    </Card>
                                                </OverlayTrigger>
                                            </label>
                                        </Col>
                                    </Row>
                                </Container>
                                <Card id="image-preview" bg={"dark"} text={"white"}>
                                    <Card.Img variant="top" src={this.state.imageOptions[this.state.selectedImage]}/>
                                </Card>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Type your task
                                </Form.Label>
                                <Form.Control as="textarea" placeholder={"Dream big and be disappointed"}
                                              value={this.state.textTask}
                                              onChange={(event) => this.setState({textTask: event.target.value})}/>
                            </Form.Group>
                            <Button variant="primary" disabled={this.state.isRequestInFlight}
                                    onClick={this.performRequest}>
                                Process
                            </Button>
                        </Form>
                    </Col>
                    <Col sm>
                        <h4>Result</h4>
                        <Form.Label>
                            The model's text output
                        </Form.Label>
                        <Card bg={"dark"} text={"white"}>
                            <Card.Body id={"model-output"}>
                                Please perform a request
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default App;
