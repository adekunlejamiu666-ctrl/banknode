const mongoose=require("mongoose")

const AccountSchema=new mongoose.Schema({
    accountNumber:{type:"String", required:true, unique:true}
}, {strict:"throw", timestamps:true})


const AccountModel=mongoose.model("account", AccountSchema)

module.exports= AccountModel