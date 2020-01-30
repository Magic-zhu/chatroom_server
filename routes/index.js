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
