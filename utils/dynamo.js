'use strict';

const AWS = require('aws-sdk');

module.exports = class Dynamo {
  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient()
  }

  /**
   * Get all items of a specific table
   *
   * @param {Object} params
   */
  async getAllItems(params) {
    // const params = {
    //     Image: this.getImageParams(image),
    //     MaxLabels: 4096,
    //     MinConfidence: threshold
    // };

    return await this.doCall('scan', params)
  }

  /**
   * Get one item of a specific table
   *
   * @param {Object} params
   */
  async getItem(params) {
    // const params = {
    //     Image: this.getImageParams(image),
    //     MaxLabels: 4096,
    //     MinConfidence: threshold
    // };

    return await this.doCall('get', params)
  }


  /**
   * Do the request to AWS Rekognition
   *
   * @param {string} endpoint
   * @param {Object} params
   */
  doCall(endpoint, params) {
    return new Promise((resolve, reject) => {
      this.docClient[endpoint](params, function (err, data) {
        if (err) {
          reject(err)
        }
        else
          if(endpoint !== 'put'){
            resolve(data)
          } else {
            resolve(params.Item)
          }
      })
    })
  }

  /**
   * Add new item to specific table
   *
   * @param {Object} params
   */
  async addItem(params) {
    // const params = {
    //     Image: this.getImageParams(image),
    //     MaxLabels: 4096,
    //     MinConfidence: threshold
    // };


    return await this.doCall('put', params)
  }
};
