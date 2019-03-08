const assert = require("assert")
const gulp = require('gulp')
const File = require('vinyl')
const streamAssert = require('stream-assert')
const nock = require('nock')

const testPath = '/Public'
const testDestinationFolder = 'gulp-dropbox-test'
const testToken = process.env.DROPBOX_TOKEN || 'c1MGYwNDJiYmYxNDFkZjVkOGI0MSAgLQ'
const dropboxApiBase = 'https://content.dropboxapi.com/2/'

const testFile = 'test/test.json'

const gulpDropbox = require('../')
let gulpDropboxInstance

// Utility methods
function isReadableStream(obj) {
    return obj !== null &&
        typeof obj === 'object' &&
        typeof obj.pipe === 'function' &&
        typeof obj._read === 'function' &&
        typeof obj._readableState === 'object'
}

// Instantiating the instance
describe("smoke test", function () {

    it("should throw error when plugin options are not passed in", function () {
        try {
            gulpDropboxInstance = gulpDropbox()

            assert.equal(true, false, 'No error was thrown')

        } catch (e) {

            const noOptionsPassedError = e.message == gulpDropbox.PLUGIN_ERROR_MISSING_OPTIONS

            assert.equal(true, noOptionsPassedError, e.message)

        }
    })

    it("should construct something gulp can use when required plugin options are passed in", function () {
        try {

            gulpDropboxInstance = gulpDropbox({
                token: testToken,
                path: testPath,
                folder: testDestinationFolder
            })

            assert.equal(true, isReadableStream(gulpDropboxInstance), 'constructer did not return a readable stream')

        } catch (e) {

            assert.equal(true, false, e.error || e.message)

        }
    })

})

// Using gulp
describe("gulp tests", function () {

    beforeEach(function() {

        gulpDropboxInstance = gulpDropbox({
            token: testToken,
            path: testPath,
            folder: testDestinationFolder
        })

    })

    it('should ignore null files', function (done) {

        gulpDropboxInstance
            .pipe(streamAssert.end(done))
        gulpDropboxInstance.write(new File( ))
        gulpDropboxInstance.end()

    })

    it('should emit error on streamed file', function (done) {

        gulp.src(testFile, { buffer: false })
            .pipe(gulpDropboxInstance)
            .on('error', function (e) {
                const inputNotBufferError = e.message == gulpDropbox.PLUGIN_ERROR_INPUT_NOT_BUFFER

                assert.equal(true, inputNotBufferError, e.message)
                done()
            })

    })
})

// Making calls to the dropbox API
describe("dropbox tests", function() {

    it('should call dropbox.filesUpload()', function (done) {
        // Intercept the post request to the dropbpx v2 upload api endpoint `/files/upload` and mock a successful response
        nock(dropboxApiBase)
            .post('/files/upload')
            .reply(200)

        gulp.src(testFile)
            .pipe(gulpDropbox({
                token: testToken,
                path: testPath,
                folder: testDestinationFolder                
            }))
            .on('error', function (e) {
                assert.equal(true, false, e.message)
                done()
            })
            .pipe(streamAssert.end(done))            
    })

})
