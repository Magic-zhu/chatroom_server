var jwt = require('jsonwebtoken');
class Token{
    constructor(){
        this.secretOrPrivateKey = "magiczhuzhu" ;// 这是加密的key（密钥） 
        this.expiretime  = "12h";// 12小时过期
    }
    /**
     * 生成token
     * @param {Object} content - 需要生成token的内容
     */
    create(content,expiretime){
        if(expiretime==-1){
            return jwt.sign(content, this.secretOrPrivateKey);
        }
        return jwt.sign(content, this.secretOrPrivateKey, {
            expiresIn: expiretime||this.expiretime
        });
     }
     /**
      * 校验token
      * @param {*} callback 
      */
     verify(token,callback){
        jwt.verify(token, this.secretOrPrivateKey, function (err, decode) {
            callback(err,decode);
        })
    }
}
module.exports = new Token();
