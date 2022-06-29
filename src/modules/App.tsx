import React from 'react';
import plus from './plus.svg'
import './App.css';
import {Button, Card, Col, Container, Form, OverlayTrigger, Placeholder, Row, Tooltip} from "react-bootstrap";

const baseURL = "https://inference-api.explainable-ofa.ml"

const sampleImages = [
    {
        url: "https://robohash.org/sfgsdfg?size=500x500",
        question: "What color is the robot?"
    }
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
        currentAnswer: {"answer": null}
    }

    componentDidMount = () => {
        this.select(0)
    }

    select = (imageID: number) => {
        this.setState({
            selectedImage: imageID,
        })
    }

    updateText = (event: any) => {
        this.setState((state: any, props) => {
            let options = state.imageOptions
            options[state.selectedImage].question = event.target.value

            return {
                imageOptions: options
            }
        })
    }

    addImageOptions = (event: any) => {
        const files: File[] = Array.from(event.target.files)
        const urls = files.map(
            (f: File) => ({
                url: URL.createObjectURL(f),
                question: ""
            })
        )

        this.setState(
            (state: any, props) => ({
                imageOptions: [...state.imageOptions, ...urls]
            })
        )
    }

    performRequest = () => {
        this.setState({
            isRequestInFlight: true
        })

        fetch(this.state.imageOptions[this.state.selectedImage].url)
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(blob => {
                const data = new FormData()
                data.append('file', blob)
                data.append('question', this.state.imageOptions[this.state.selectedImage].question)

                return fetch(baseURL + '/process_image', {
                    method: 'POST',
                    body: data
                })
            })
            .then(res => res.json())
            .then(json => {
                this.processAnswer(json)
                this.setState({
                    isRequestInFlight: false,
                })
            })
    }

    processAnswer = (answer: any) => {
        this.setState({
            currentAnswer: answer,
        })
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
                                                            <Card.Img src={value.url} style={{color: "white"}}/>
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
                                    <Card.Img variant="top"
                                              src={this.state.imageOptions[this.state.selectedImage].url}/>
                                </Card>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Type your task
                                </Form.Label>
                                <Form.Control className={"bg-dark"} id={"main-input"} as="textarea"
                                              placeholder={"Dream big and be disappointed"}
                                              value={this.state.imageOptions[this.state.selectedImage].question}
                                              onChange={this.updateText}/>
                            </Form.Group>
                            <Button variant="primary" disabled={this.state.isRequestInFlight}
                                    onClick={this.performRequest}>
                                Process
                            </Button>
                        </Form>
                    </Col>
                    <Col sm>
                        <h4>Result</h4>
                        <Card bg={"dark"} text={"white"} id={"model-output"}>
                            {
                                this.state.isRequestInFlight
                                    ? <Placeholder as={Card.Body} animation="wave">
                                        <Placeholder xs={7}/> <Placeholder xs={4}/> <Placeholder xs={4}/>{' '}
                                        <Placeholder xs={6}/>
                                    </Placeholder>
                                    : <Card.Body>
                                        {this.state.currentAnswer.answer == null
                                            ? <em className={"sample-text"}>Please perform a request</em>
                                            : this.state.currentAnswer.answer
                                        }
                                    </Card.Body>
                            }
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default App;
