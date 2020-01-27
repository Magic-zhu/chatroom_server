const express = require('express');
const router = express.Router();
const token = require("../utils/token");
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        console.log(file)
      cb(null, Date.now()+ file.originalname)
    }
  })
const upload = multer({storage});
const fs = require('fs')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//路由拦截
// router.all("/*",(req,res,next)=>{
//     let {query} = req;
//     console.log(req.url)
//     if(req.url==="/login"||req.url==="/register"){
//         next()
//     }else{
//         token.verify(query.token,(err,decode)=>{
//             if(err){
//                 switch(err.message){
//                     case "jwt malformed":
//                         res.json({
//                             code:210,
//                             message:"错误的token"
//                         })
//                         break
//                     case "jwt expired":
//                         res.json({
//                             code:211,
//                             message:"token过期"
//                         })
//                         break
//                     default:
//                         res.json({
//                             code:212,
//                             message:err.message
//                         })
//                 }
//             }else{
//                 next()
//             }
//         })
//     }
// })

router.post("/upload",upload.single('file'),function(req,res,next){
    if(!req.file){
        res.json({
            errcode:41,
            message:"参数错误",
            data:null,
        })
    }else{
        res.json({
            errcode:0,
            message:"上传成功",
            data:'http://localhost:8086/uploads/'+req.file.filename,
         })
    }
})
module.exports = router;
