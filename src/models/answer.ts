class Answer {
    constructor(
        public answer: string,
        public decoder_indices: number[],
        public encoder_indices: number[],
        public txt_attns: number[][],
        public request_code: string,
    ) {
    }

}

export default Answer