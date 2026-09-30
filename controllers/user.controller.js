const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/user.model");
const AccountModel = require("../models/account.model");
const nodemailer = require("nodemailer")
const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_KEY,
  api_secret:process.env.CLOUD_SECRET

})


let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS
  }
});


const registerUser = async (req, res) => {
  const { firstname, lastname, email, password, tag } = req.body;

  try {

    const saltround = await bcryptjs.genSalt(10);

    const hashPass = await bcryptjs.hash(password, saltround);

     const number = `${Math.ceil (Math.random()*10000000)}`.padStart(7,"0")
     const accountNumber = `AUG${number}`;
       
    const userAccount= await AccountModel.create({
      accountNumber
    })
const image = await cloudinary.uplaod(photo,{resource_type:"image"})
    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      tag:tag.trim().length<1&&tag,
      password: hashPass,
      accountNumber:generatedAccount,
      profilePicture:{
        secure_url:image.secure_url,
        public_id:image.public_id
      }
      
    });
      

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );
   
let mailOptions = {
  from: process.env.APP_EMAIL,
  // to: [],
  bcc:[""],
  subject: `Welcome To August Bank${firstname}`,
  text: `Welcome to August Bank Where Transaction is Made Easy You Account Number is ${user.accountNumber}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

    return res.status(201).send({
      message: "User created successfully",
      data: {
        firstname,
        lastname,
        email,
        role:user.role,
        tag: tag ? tag : null,
        accountNumber,
        balance: user.balance,
        token,
        photo:user.profilePicture.secure_url
      }
    });

  } catch (error) {
    console.log(error);
    

    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).send({
        message: "Email or tag already exists"
      });
    }

    return res.status(400).send({
      message: "User cannot be created at this time",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isUser = await UserModel.findOne({ email }).select("+password");

    if (!isUser) {
      return res.status(404).send({
        message: "User not found"
      });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      isUser.password
    );

    if (!passwordMatch) {
      return res.status(401).send({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      {
        id: isUser._id,
        role: isUser.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    return res.status(200).send({
      message: "Login successful",
      data: {
        firstname: isUser.firstname,
        lastname: isUser.lastname,
        email: isUser.email,
        role: isUser.role,
        tag: isUser.tag ? isUser.tag : null,
        balance:isUser.balance,
        token
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).send({
      message: "User cannot login at this time",
      error: error.message
    });
  }
};

const loginOperator = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isOperator = await UserModel.findOne({ email }).select("+password");

    if (!isOperator) {
      return res.status(404).send({
        message: "Operator not found"
      });
    }

    if (isOperator.role !== "operator") {
      return res.status(403).send({
        message: "This account is not an operator"
      });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      isOperator.password
    );

    if (!passwordMatch) {
      return res.status(401).send({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      {
        id: isOperator._id,
        role: isOperator.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    return res.status(200).send({
      message: "Operator login successful",
      data: {
        firstname: isOperator.firstname,
        lastname: isOperator.lastname,
        email: isOperator.email,
        tag: isOperator.tag,
        role: isOperator.role,
        token
      }
    });

  } catch (error) {
    console.log("Operator login error:", error);

    return res.status(500).send({
      message: "Operator cannot login at this time",
      error: error.message
    });
  }
};


const updateUser = async (req, res) => {
  const { id } = req.params;
    const {role}= req.user
    const {firstname, lastname}=req.body

    try{
        if(role!=="operator"&&role!=="admin"){
          return res.status(403).send({
            message:"Forbideen Resource"
          })
        }
           const allowedUpdate = {
            ...(firstname&&{firstname}),
            ...(lastname&&{lastname})
           } 

           const updatedUser = await UserModel.findByIdAndUpdate(id,allowedUpdate, {returnDocument:"after", runValidators:true})
           if(!updatedUser){
            return res.status(400).send({
                message:"can't update user at this time"
            })
           }
           return res.status(200).send({
            message: "user updated successfully"

           })
    }catch (error){
        console.log("UPDATE USER ERROR:", error);
        return res.status(500).send({
          message: "Cannot update user at this time"
        });
    }


};

const getUserProfile = async (req, res) => {
    const { id } = req.user;
    try {

    const user = await UserModel
      .findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(400).send({
        message: "User not found"
      });
    }
  return res.status(200).send({
      message: "User information fetched successfully",
      data: user
    });

  } catch (error) {

    console.log(error);

    return res.status(500).send({
      message: "Cannot fetch user information"
    });
  }
};


const getUserByOperator = async (req, res) => {
const { id, role } = req.user;
const{userId}=req.params;
    try {
     if (role !== "admin" && role !== "operator") {
      return res.status(403).send({
        message: "Forbidden resource"
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: "User not found" 
      });
    }

    return res.status(200).send({
      message: "User information fetched successfully",
      data: user
    });

  } catch (error) {
    console.log(error);

    return res.status(500).send({
      message: "Cannot fetch user information"
    });
  }
};

const resolveAccount=async(req, res)=>{
  const{accountNumber}=req.params
  try{
    const user=await UserModel.findOne({accountNumber})

    if(!user){
        return res.status(404).send({
            message:"can't resolve account number"
        })

    }
    res.status(200).send({
        message:"account resolved",
        data:{
            accountname:user.firstname+" "+user.lastname,
            tag:user.tag?user.tag:null,
            id:user_id

        }
    })
  }catch(error){
    console.log(error);

    return res.status(500).send({
        message:"can't resolve account number"
    })
    
  }

}




const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1]
      ? req.headers["authorization"].split(" ")[1]
      : req.headers["authorization"].split(" ")[0];

    const user = await jwt.verify(
      token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          res.status(401).send({
            message: "User unauthorized!",
          });
          return;
        }

        req.user = decoded;
        console.log(decoded);

        next();
      },
    );
  } catch (error) {
    console.log(error);

    res.status(401).send({
      message: "User unauthorized!",
    });
    return;
  }
};


const registerOperator = async (req, res) => {
  const { firstname, lastname, email, password, tag } = req.body;

  try {
    const saltround = await bcryptjs.genSalt(10);

    const hashPass = await bcryptjs.hash(password, saltround);

    const operator = await UserModel.create({
      firstname,
      lastname,
      email,
      tag,
      password: hashPass,
      role: "operator" 
    });

    const token = jwt.sign(
      {
        id: operator._id,
        role: operator.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    return res.status(201).send({
      message: "Operator created successfully",
      data: {
        firstname: operator.firstname,
        lastname: operator.lastname,
        email: operator.email,
        tag: operator.tag,
        role: operator.role,
        token
      }
    });

  } catch (error) {
    console.log("REGISTER OPERATOR ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).send({
        message: "Email or tag already exists"
      });
    }

    return res.status(400).send({
      message: "Operator cannot be created at this time",
      error: error.message
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  loginOperator,
  getUserProfile,
  verifyUser,
  registerOperator,
  getUserByOperator,
  updateUser,
  resolveAccount

};