export class ValidationError extends Error {
    constructor (message:string,public details ?:any){
        super(message);
        this.name = 'ValidationError';
    }
}

export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number,
        public code: string,
        public details?: any,
    ){
        super(message);
        this.name= 'ApiError'
    }
}