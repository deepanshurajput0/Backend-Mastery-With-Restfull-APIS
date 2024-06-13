import multer from "multer"

const store = multer.diskStorage({
    destination:function(req,file,callback){
     return callback(null,'uploads')
    },
    filename:function(req,file,callback){
     return callback(null,file.fieldname + Date.now() + '.jpg')
    }
})



export const upload = multer({
    storage:store
})