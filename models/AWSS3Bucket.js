
// import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3=require("@aws-sdk/client-s3")

const dotenv = require('dotenv')
const AWSS3PhotoEdit = require("./AWSS3PhotoEdit")
dotenv.config()




let AWSS3Bucket=function(){
  this.smallBucketName = process.env.AWS_SMALL_BUCKET_NAME
  this.mediumBucketName=process.env.AWS_MEDIUM_BUCKET_NAME
  this.largeBucketName=process.env.AWS_LARGE_BUCKET_NAME
  this.region = process.env.AWS_BUCKET_REGION
  this.accessKeyId = process.env.AWS_ACCESS_KEY
  this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  
  this.s3Client = new s3.S3Client({
    region:this.region,
    credentials: {
      accessKeyId:this.accessKeyId,
      secretAccessKey:this.secretAccessKey
    }
  })
}

AWSS3Bucket.prototype.uploadLargePhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      const uploadParams = {
        Bucket: this.largeBucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: "image/jpeg"
      }
      await this.s3Client.send(new s3.PutObjectCommand(uploadParams))
      resolve()
    }catch{
      reject()
    }
  })
}

AWSS3Bucket.prototype.uploadMediumPhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      const uploadParams = {
        Bucket: this.mediumBucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: "image/jpeg"
      }
      await this.s3Client.send(new s3.PutObjectCommand(uploadParams))
      resolve()
    }catch{
      reject()
    }
  })
}

AWSS3Bucket.prototype.uploadSmallPhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      const uploadParams = {
        Bucket: this.smallBucketName,
        Body: fileBuffer,
        Key: fileName,
        ContentType: "image/jpeg"
      }
      await this.s3Client.send(new s3.PutObjectCommand(uploadParams))
      resolve()
    }catch{
      reject()
    }
  })
}

AWSS3Bucket.prototype.getPhoto=function(size,key){
  return new Promise(async (resolve, reject) => {
    try{
      let bucketName
      if(size=="small"){
        bucketName=this.smallBucketName
      }else if(size=="medium"){
        bucketName=this.mediumBucketName
      }else if(size=="large"){
        bucketName=this.largeBucketName
      }else{
        reject()
      }
      let input={
        Bucket: bucketName,
        Key: key,
      }
      const command = new s3.GetObjectCommand(input);
      const response = await this.s3Client.send(command)

      resolve(response.Body)
    }catch{
      console.log("I am from getPhoto error.")
      reject()
    }
  })
}

//for dummy use
AWSS3Bucket.prototype.uploadPhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      let largeBufferData=await AWSS3PhotoEdit.editAsLargeImage(fileBuffer)
      let mediumBufferData=await AWSS3PhotoEdit.editAsMediumImage(fileBuffer)
      let smallBufferData=await AWSS3PhotoEdit.editAsSmallImage(fileBuffer)
      
      await this.uploadLargePhoto(largeBufferData, fileName)
      await this.uploadMediumPhoto(mediumBufferData, fileName)
      await this.uploadSmallPhoto(smallBufferData, fileName)
      resolve()
    }catch{
      reject()
    }
  })
}

AWSS3Bucket.prototype.uploadProfilePhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      let mediumBufferData=await AWSS3PhotoEdit.editAsMediumImage(fileBuffer)
      let smallBufferData=await AWSS3PhotoEdit.editAsSmallImage(fileBuffer)
      
      await this.uploadMediumPhoto(mediumBufferData, fileName)
      await this.uploadSmallPhoto(smallBufferData, fileName)
      resolve()
    }catch{
      reject()
    }
  })
}


AWSS3Bucket.prototype.uploadCoverPhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      let largeBufferData=await AWSS3PhotoEdit.editAsLargeImage(fileBuffer)
      let mediumBufferData=await AWSS3PhotoEdit.editAsMediumImage(fileBuffer)
      
      await this.uploadLargePhoto(largeBufferData, fileName)
      await this.uploadMediumPhoto(mediumBufferData, fileName)
      resolve()
    }catch{
      reject()
    }
  })
}


AWSS3Bucket.prototype.uploadBannerPhoto=function(fileBuffer, fileName){
  return new Promise(async (resolve, reject) => {
    try{
      let largeBufferData=await AWSS3PhotoEdit.editAsLargeImage(fileBuffer)
      let mediumBufferData=await AWSS3PhotoEdit.editAsMediumImage(fileBuffer)
      
      await this.uploadLargePhoto(largeBufferData, fileName)
      await this.uploadMediumPhoto(mediumBufferData, fileName)
      resolve()
    }catch{
      reject()
    }
  })
}
module.exports=AWSS3Bucket