const fs = require('fs-extra')

module.exports = class BaseWork {
    constructor ({ har, dir }) {
        this.har = har
        this.dir = dir || './output'
        fs.ensureDirSync(this.dir)
    }
    async eachFile (cb) {
        const files = fs.readdirSync(this.dir)

        for (let file of files) {
            const data = fs.readFileSync(this.dir + '/' + file);
            const result =  cb(data.toString())

            if (result) {
                fs.writeFileSync(this.dir + '/' + file, result)
            }
        }
    }
}
