const path = require('path')

module.exports = {
    mode : 'none',
    entry : './docs/example.js',
    output : {
        path : path.resolve(__dirname, 'docs'),
        filename : 'build/build.example.js'
    }
}
