const checkUser=async(req,res,next)=>{
    
    if(req.session.userData){
        next()
    }else{
        res.redirect('/login')
    }
}
module.exports={
    checkUser
}