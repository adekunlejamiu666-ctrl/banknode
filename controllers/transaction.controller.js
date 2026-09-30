const TransactionModel = require("../models/transaction.model")


const transferFunds = async (req, res) => {

    const { accountNumber, amount, description, } = req.body
    const { id } = req.user
    try {
          const receiver=await UserModel.findOne({accountNumber})

          if(!receiver){
             return res.status(400).send({
                message:"can't resolve account number"
             })
          }
const transaction = await TransactionModel.create({
    
})
        

    } catch (error) {

    }
}