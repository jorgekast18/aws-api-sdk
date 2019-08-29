'use strict'

const AWS = require('aws-sdk')
const fs = require('fs')
const debug = require('debug')('cetoco-rekognition:s3')
const fileType = require('file-type')

const VALID_FORMATS = ['jpg', 'jpeg', 'png']

module.exports = class S3 {
    constructor() {
        this.s3 = new AWS.S3({
            params: {
                Bucket: process.env.AWS_BUCKET,
                Region: process.env.REGION
            }
        })
    }

    /**
     * Upload file to S3 bucket into specified folder
     * 
     * @param {string} imageBase64 
     * @param {string} folder 
     */
    async upload(imageBase64, folder, fileName) {
        
        return new Promise((resolve, reject) => {

            
            let buffer = new Buffer(imageBase64, 'base64')

            const params = {
                Key: fileName + '_' + new Date().getTime() + '.jpg',
                Body: buffer
            }

            const opts = {
                queueSize: 10, // upload parts in parallel
                partSize: 1024 * 1024 * 10 //10Mb
            }
            
            this.s3.upload(params, opts)
                .on('httpUploadProgress', function (evt) {
                    debug('upload-part', evt.loaded, '/', evt.total)
                })
                .send(function (err, data) {
                    if (err) {
                        debug('upload-error', err)
                        reject(err)
                    }
                    resolve(data)
                })
        })
       
    }

    /**
     * Upload multiple files in parallel to S3 bucket into specified folder
     * 
     * @param {Array.<strings>} filePaths 
     * @param {string} folder 
     * @returns {Promise.<Array>} of S3 files in the same input order
     */
    async uploadMultiple(filePaths, folder) {
        return await Promise.all(
            filePaths.map(filePath => this.upload(filePath, folder))
        )
    }

    /**
     * Check if file exists in S3
     * 
     * @param {string} s3FilePath 
     * @return {Promise.<boolean>}} 
     */
    async exists(s3FilePath) {
        return new Promise((resolve, reject) => {
            this.s3.headObject({ Key: s3FilePath }, function (err, data) {
                if (!err)
                    resolve(true)

                resolve(false)
            })
        })
    }

    /**
     * Creates the S3 path and checks the file format
     * 
     * @param {string} filePath 
     * @param {string} folder 
     */
    getS3FullPath(filePath) {
        const folder = process.env.AWS_BUCKET_FOLDER_OLIMPIA
        const fileName = new Date().getTime() + '-' + filePath.split('/').pop()
        const extension = fileName.split('.').pop().toLowerCase()

        if (VALID_FORMATS.indexOf(extension) !== -1)
            return folder + fileName
        else
            throw new Error('Invalid file format')
    }
}

