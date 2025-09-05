export type LogLevel = 'info' | 'debug' | 'error' | 'warn';

export interface LogEntry {
    timestamp: string;
    component: string;
    functionName: string;
    level: LogLevel;
    message: string;
    data?: any;
}

export class Logger {
    private static minLevel: LogLevel = process.env.NODE_ENV === 'production'?'error':'debug';
    private static levelPriority : Record<LogLevel,number>={
        error:3,
        warn:2,
        info:1,
        debug:0
    }

    static shouldLog(level:LogLevel):boolean{
        return this.levelPriority[level] >= this.levelPriority[this.minLevel];
    }
    static log(
        component:string,
        functionName:string,
        level:LogLevel,
        message:string,
        data?:any
    ){

        if(!this.shouldLog(level))return;
        const entry : LogEntry ={
            timestamp: new Date().toISOString(),
            component,
            functionName,
            level,
            message,
            data
        }

        console[level](`${entry.timestamp}[${entry.component}][${entry.functionName}][${entry.level}] ${entry.message}`, data||'');
    }

    static time(component:string,functionName:string,label:string){
        if(this.shouldLog('debug')){
            console.time(`${component}:${functionName}:${label}`);
        }
    }

    static timeEnd(component:string,functionName:string, label:string){
        if(this.shouldLog('debug')){
            console.timeEnd(`${component}:${functionName}:${label}`);
        }
    }
}