

const authadmin=(req,res,next)=>{
  const{role}=req.userInfo;
  if(role!=='admin'){
    return res.status(401).json({message:'access denied'})

  }
  next();
}