import React from 'react';
import plus from './plus.svg'
import './App.css';
import {Button, Card, Col, Container, Form, OverlayTrigger, Placeholder, Row, Tooltip} from "react-bootstrap";
import Answer from "../models/answer";
import ReactMarkdown from 'react-markdown'


const reducer = require('image-blob-reduce')();

const baseURL = "https://inference-api.explainable-ofa.ml"

const sampleImages = [
    {
        url: "/images/traffic.jpg",
        question: "How many cars are in the picture?",
        answer: null as Answer | null,
        selectedExplanation: null as number | null,
    },
    {
        url: "/images/basil.jpg",
        question: "Describe the image",
        answer: null as Answer | null,
        selectedExplanation: null as number | null,
    },
    {
        url: "/images/robot.png",
        question: "What color are the robot's eyes?",
        answer: null as Answer | null,
        selectedExplanation: null as number | null,
    },
]

const maxImageSize = 384

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
        errorStr: null as string | null,
        readme: "test"
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
        const selectedImage = this.state.selectedImage
        this.setState((state: any, props) => {
            let options = state.imageOptions
            options[selectedImage].selectedExplanation = null

            return {
                imageOptions: options,
                isRequestInFlight: true,
            }
        })

        fetch(this.state.imageOptions[selectedImage].url)
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then((blob: Blob) => {
                return reducer.toBlob(blob, {max: maxImageSize})
            })
            .then((blob) => {
                const data = new FormData()
                data.append('file', blob)
                data.append('question', this.state.imageOptions[selectedImage].question)

                return fetch(baseURL + '/process_image', {
                    method: 'POST',
                    body: data
                })
            })
            .then(res => res.json())
            .then(json => {
                this.setState((state: any, props) => {
                    let options = state.imageOptions
                    options[selectedImage].answer = json as Answer

                    return {
                        imageOptions: options,
                        isRequestInFlight: false,
                        errorStr: null,
                    }
                })
            })
            .catch(reason => {
                this.setState({
                    isRequestInFlight: false,
                    errorStr: "Inference request failed. Sorry!",
                })
            })
    }

    selectExplanation = (selectedImage: number, index: number | null) => {
        this.setState(
            (state: any, props) => {
                state.imageOptions[selectedImage].selectedExplanation = index

                return {
                    imageOptions: state.imageOptions
                }
            }
        )
    }

    componentDidMount() {
        fetch('https://raw.githubusercontent.com/bjoernpl/OFA_Explain/main/ExplainReadme.md')
            .then((response) => response.text())
            .then((response) => {
                this.setState({
                    readme: response
                })
            })
    }

    renderResults = () => {
        if (this.state.isRequestInFlight) {
            return <Placeholder as={Card.Body} animation="wave">
                <Placeholder xs={7}/> <Placeholder xs={4}/> <Placeholder xs={4}/>{' '}
                <Placeholder xs={6}/>
            </Placeholder>
        }


        let rendered = <em className={"sample-text"}>Please perform a request</em>
        const currImageObject = this.state.imageOptions[this.state.selectedImage]

        if (this.state.errorStr != null) {
            rendered = <em className={"sample-text"}>{this.state.errorStr}</em>
        } else if (currImageObject.answer != null) {
            const tokens = currImageObject.answer.answer.split(" ")
            rendered = <>
                {tokens.map(
                    (value: string, index: number, array: string[]) => {
                        return <span key={value + '' + index}>
                            <Button
                                variant="secondary"
                                onClick={() => this.selectExplanation(this.state.selectedImage, index)}
                            >
                                {value}
                            </Button>{' '}
                        </span>
                    }
                )}
            </>
        }

        return <Card.Body>{rendered}</Card.Body>
    }

    render() {
        const currImageObject = this.state.imageOptions[this.state.selectedImage]
        let imageURL = currImageObject.url


        if (currImageObject.selectedExplanation != null) {
            const reqCode = currImageObject.answer?.request_code

            imageURL = baseURL + "/response/decoder/"
                + currImageObject.selectedExplanation + ".jpg?request_code=" + reqCode
        }


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
                                    <Card.Img variant="top" src={imageURL}/>
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
                            <Button variant="primary"
                                    disabled={this.state.isRequestInFlight || currImageObject.question === ""}
                                    onClick={this.performRequest}>
                                Process
                            </Button>
                        </Form>
                    </Col>
                    <Col sm>
                        <h4>Result</h4>
                        <Form.Label>
                            Click on the highlighted output tokens to reveal the explanation.
                            &nbsp;
                            <a href={"#"}
                               onClick={() => this.selectExplanation(this.state.selectedImage, null)}
                            >
                                Reset to original image
                            </a>
                        </Form.Label>
                        <Card bg={"dark"} text={"white"} id={"model-output"}>
                            {this.renderResults()}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <ReactMarkdown>
                        {this.state.readme}
                    </ReactMarkdown>
                </Row>
            </Container>
        );
    }
}

export default App;
