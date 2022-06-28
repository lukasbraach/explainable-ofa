import React from 'react';
import plus from './plus.svg'
import './App.css';
import {Button, Card, Col, Container, Form, OverlayTrigger, Row, Tooltip} from "react-bootstrap";

const sampleImages = [
    "https://robohash.org/sfgsdfg?size=1000x1000",
    "https://robohash.org/okadsofasdf?size=1000x1000",
    "https://robohash.org/oilejfnynöl?size=1000x1000"
]

const addYourOwnTooltip = (props: any) => (
    <Tooltip {...props}>
        Upload your own
    </Tooltip>
);

class App extends React.Component {
    state = {
        selectedImage: 0,
        imageOptions: [...sampleImages]
    }

    select = (imageID: number) => {
        this.setState({
            selectedImage: imageID
        })
    }

    addFiles = (event: any) => {
        const files: File[] = Array.from(event.target.files)
        const urls = files.map(
            (f: File) => URL.createObjectURL(f)
        )
        console.log(files)

        this.setState(
            (state: any, props) => ({
                imageOptions: [...state.imageOptions, ...urls]
            })
        )
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
                    <Col>
                        <h4>Input</h4>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Select an image
                                </Form.Label>
                                <Container fluid className={"p-0"}>
                                    <Row className={"mb-1"}>
                                        <Col className={"preview-container"}>
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
                                            <input type="file" id="file-input" accept="image/*" multiple
                                                   onChange={this.addFiles}/>
                                            <label htmlFor="file-input">
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{show: 50, hide: 50}}
                                                    overlay={addYourOwnTooltip}
                                                >

                                                    <Card className={"image-preview"} bg={"dark"}>
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
                                <Form.Control as="textarea" placeholder={"What does the image describe?"}/>
                            </Form.Group>
                            <Button variant="primary" disabled>
                                Process
                            </Button>
                        </Form>
                    </Col>
                    <Col>
                        <h4>Result</h4>
                        <Form.Label>
                            The model's text output
                        </Form.Label>
                        <Card bg={"dark"} text={"white"}>
                            <Card.Body>Blablabla</Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default App;
