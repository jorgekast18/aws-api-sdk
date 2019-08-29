'use strict';
const Recognition = require('./utils/rekognition');
let Dynamo = require('./utils/dynamo');

const Twilio = require('./utils/twilio');

let rekognition = new Recognition();
let dynamo = new Dynamo();

/**
 * @apiGroup Rekognition
 * @api {post} https://tzr3anh3h6.execute-api.us-east-2.amazonaws.com/dev/rekognition Upload image to s3 bucket
 * @apiDescription This service upload image in base64 to s3 bucket
 * @apiParam {string} imageBase64 Image in base64 to upload
 * @apiSuccess {Boolean} Ok service is success ?
 * @apiSuccess {String} message Message with success process.
 * @apiSuccessExample {json} Success
 *  ok: true,
 *  message: 'File success upload.'
 */
module.exports.uploadS3 = async (event, context) => {
  
  const body = JSON.parse(event.body);

  const imageBase64 = body.imageBase64;
  const defaultFolder = body.defaultFolder || process.env.AWS_BUCKET_FOLDER_OLIMPIA;
  const fileName = body.fileName || '';

  const images = await rekognition.uploadToS3(imageBase64, defaultFolder, fileName);

  return {
    body: JSON.stringify({
      message: 'File success upload.',
      data: images,
    })
  };
};

/**
 * @apiGroup Rekognition
 * @api {post} https://tzr3anh3h6.execute-api.us-east-2.amazonaws.com/dev/compare-faces
 * compare the faces of the two images in base64
 * @apiDescription This service compare the faces of the two images in base64
 * @apiParam {string} SourceImage First image in base64 to upload
 * @apiParam {string} TargetImage Second image in base64 to upload
 * @apiSuccess {Boolean} Ok service is success ?
 * @apiSuccess {Object} data Data with the results of the comparison
 * @apiSuccessExample {json} Success
 *  ok: true,
 *  data: {
 *      {
 * "ok": true,
 * "data": {
 *   "SourceImageFace": {
 *     "BoundingBox": {
 *       "Width": 0.27123841643333435,
 *       "Height": 0.6196115612983704,
 *       "Left": 0.3554128408432007,
 *       "Top": 0.13535375893115997
 *     },
 *     "Confidence": 99.99998474121094
 *   },
 *   "FaceMatches": [
 *     {
 *       "Similarity": 99.70835876464844,
 *       "Face": {
 *         "BoundingBox": {
 *           "Width": 0.15156203508377075,
 *           "Height": 0.4081224203109741,
 *           "Left": 0.4619642198085785,
 *           "Top": 0.0786842480301857
 *         },
 *         "Confidence": 99.99998474121094,
 *         "Landmarks": [
 *           {
 *             "Type": "eyeLeft",
 *             "X": 0.5045753717422485,
 *             "Y": 0.2188815474510193
 *           },
 *           {
 *             "Type": "eyeRight",
 *             "X": 0.5730355381965637,
 *             "Y": 0.23236408829689026
 *           },
 *           {
 *             "Type": "mouthLeft",
 *             "X": 0.5033063888549805,
 *             "Y": 0.3644188940525055
 *           },
 *           {
 *             "Type": "mouthRight",
 *             "X": 0.5594552159309387,
 *             "Y": 0.37553170323371887
 *           },
 *           {
 *             "Type": "nose",
 *             "X": 0.538753092288971,
 *             "Y": 0.2986147403717041
 *           }
 *         ],
 *         "Pose": {
 *           "Roll": 4.021029472351074,
 *           "Yaw": -14.957561492919922,
 *           "Pitch": 3.950698137283325
 *         },
 *         "Quality": {
 *           "Brightness": 85.14419555664062,
 *           "Sharpness": 83.14741516113281
 *         }
 *       }
 *     }
 *   ],
 *   "UnmatchedFaces": []
 *  }
 * }
 *  }
 */
module.exports.compareFaces = async (event, context) => {

  const body = JSON.parse(event.body);

  console.log(body)
  
  const SourceImage = body.SourceImage;
  const TargetImage = body.TargetImage;

  console.log(SourceImage)
  console.log(TargetImage)
  

  const result = await rekognition.compareFaces(SourceImage, TargetImage);

  return {
    body: JSON.stringify({
      ok: true,
      data: result
    })
  };
};

module.exports.createCollection = async (event, context) => {

  const body = JSON.parse(event.body);
  
  const collectionId = body.collectionId;

  const result = await rekognition.createCollection(collectionId);

  return {
    body: JSON.stringify({
      ok: true,
      data: result
    })
  };
};

module.exports.deleteCollection = async (event, context) => {

  const body = JSON.parse(event.body);
  
  const collectionId = body.collectionId;

  const result = await rekognition.deleteCollection(collectionId);

  return {
    body: JSON.stringify({
      ok: true,
      data: result
    })
  };
};

module.exports.indexFaces = async (event, context, callback) => {

  let resultAddItem = null;
  const body = JSON.parse(event.body);

  const collectionId = process.env.AWS_COLLECTION_ID;
  const image = body.image;

  const result = await rekognition.indexFaces(collectionId, image);

  if(result.FaceRecords && result.FaceRecords.length > 0){
    const imageSaved = result.FaceRecords[0].Face;

    const params = {
      TableName: process.env.AWS_DYNAMO_TABLE,
      Item: {
        id: new Date().getTime(),
        client_name: body.client_name,
        client_photo: imageSaved.ImageId,
        phone_number: body.phone_number,
        document_number: body.client_photo,
        face_id: imageSaved.FaceId,
        request_type: body.request_type,
        timestamp: new Date().getTime()
      }
    }

    resultAddItem = await dynamo.addItem(params);
  }

  callback(null, {
    statusCode: '200',
    body: JSON.stringify({
      ok: true,
      image: result,
      item: resultAddItem
    }),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
};

module.exports.listFaces = async (event, context) => {

  const body = JSON.parse(event.body);
  
  const collectionId = body.collectionId;

  const result = await rekognition.listFaces(collectionId);

  return {
    body: JSON.stringify({
      ok: true,
      data: result
    })
  };
};

module.exports.searchFacesByImage = async (event, context, callback) => {

  let userData = null;
  const body = JSON.parse(event.body);
  
  const collectionId = body.collectionId;
  const image = body.image;

  const result = await rekognition.searchFacesByImage(collectionId, image);

  if(result.FaceMatches && result.FaceMatches.length > 0){
    const faceId = result.FaceMatches[0].Face.FaceId;
    const params = {
      TableName: process.env.AWS_DYNAMO_TABLE,
      Key: {
        face_id: faceId
      }
    }
   
    userData = await dynamo.getItem(params);

    if(userData && userData.Item.phone_number){
      Twilio.sendMessage(userData.Item);
    }
  }
  callback(null, {
    statusCode: '200',
    body: JSON.stringify({
      ok: true,
      data: result,
      userData: userData
    }),
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
  });
};

module.exports.getItemById = async (event, context, callback) => {

  const body = JSON.parse(event.body);
  
  const params = {
    TableName: 'davivienda-turnos',
    Key: {
      id: 1,
      timestamp: 897392878
    }
  }
 
  const result = await dynamo.getItem(params);

  callback(null, {
    statusCode: '200',
    body: JSON.stringify({
      ok: true,
      data: result
    }),
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
  });
};

module.exports.addItem = async (event, context, callback) => {

  const body = JSON.parse(event.body);
  
  const params = {
    TableName: 'davivienda-turnos',
    Item: {
      id: new Date().getTime(),
      client_name: body.client_name,
      client_photo: body.client_photo,
      document_number: body.client_photo,
      face_id: body.client_photo,
      request_type: body.client_photo,
      timestamp: new Date().getTime()
    }
  }
 
  const result = await dynamo.addItem(params);

  callback(null, {
    statusCode: '200',
    body: JSON.stringify({
      ok: true,
      data: result
    }),
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
};
