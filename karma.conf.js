import { types } from 'node:util';

export default function (config) {
    config.set({
        //logLevel: config.LOG_DEBUG,
        plugins: [
            'karma-jasmine',
            'karma-mocha-reporter',
            'karma-chrome-launcher',
            'karma-typescript'
        ],
        frameworks: ['jasmine', 'karma-typescript'],
        files: [
            'test/**/*.ts',
            'src/**/*.ts'
        ],
        exclude: [
            "./**/*.d.ts"
        ],
        preprocessors: {
            'src/**/*.ts': ['karma-typescript'],
            'test/**/*.ts': ['karma-typescript']
        },
        reporters: ['mocha', 'karma-typescript'],
        browsers: ['ChromeHeadless'],
        singleRun: true,
        colors: true,
        karmaTypescriptConfig: {
            coverageOptions: {
                exclude: /test\/.*/
            },
            reports: {
                'text': '',
                'html': 'coverage'
            },
            compilerOptions: {
                target: 'ES5',
                lib: [ 'ES6', 'DOM' ],
                types: [ 'node', 'jasmine' ],
                emitDecoratorMetadata: false,
                experimentalDecorators: false
            },
            exclude: ["node_modules"]
        },
        browserConsoleLogOptions: {
            terminal: true,
            level: ''
        }
    })
};
