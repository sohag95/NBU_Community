const sharp=require("sharp")

//fit:fill ---image will be shown as it uploaded but viwe ratio will change according tothe set hight and width
//fit:contain --image as it is but extra space will be filled with black colored
//fit:cover(default) cuts the image according to the given size
  
let AWSS3PhotoEdit=function(data){
  this.data=data
}

AWSS3PhotoEdit.editAsLargeImage=function(buffer){
  return new Promise(async (resolve, reject) => {
    try{
      let bufferData=await sharp(buffer).resize(1200, 720,{ fit: 'fill'}).toFormat('jpeg').toBuffer()
      resolve(bufferData)
    }catch{
      reject(null)
    }
  })
}

AWSS3PhotoEdit.editAsMediumImage=function(buffer){
  return new Promise(async (resolve, reject) => {
    try{
      let bufferData=await sharp(buffer).resize(250, 200,{ fit: 'contain'}).toFormat('jpeg').toBuffer()
      resolve(bufferData)
    }catch{
      reject(null)
    }
  })
}

AWSS3PhotoEdit.editAsSmallImage=function(buffer){
  return new Promise(async (resolve, reject) => {
    try{
      let bufferData=await  sharp(buffer).resize(40, 40,{ fit: 'fill'}).toFormat('jpeg').toBuffer()
      resolve(bufferData)
    }catch{
      reject(null)
    }
  })
}

module.exports=AWSS3PhotoEdit