require("dotenv").config();

const express = require("express");

//mongoose connection
const connectDB = require("./connection");

// mongoose model
const patientModel = require("./patient");

//hashing
const secret = "HEALTH_CONNECT";
const crypto = require("crypto").createHmac;

//const sha256Hasher = crypto.

const app = express();


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// configuration
app.use(express.json());


// GET
// route: /
// description: To get all patient
// parameter: none 
app.get("/", async (req, res) => {
    
    const patient = await patientModel.find();
    if (!patient){
            return res.json ({message: "Not Avalaible"});
        }
    return res.json({patient});

}); 

// GET
// route: /patient/:_id
// description: To get patient with 'id'
// parameter: _id 
app.get("/patient/:_id", async (req, res) => {
    
    try{
        const { _id } = req.params;
        const patient = await patientModel.findById(_id);
        if (!patient){
            return res.json ({message: "invalid ID"});
        }
        return res.json ({ patient });
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
    
    
});


// GET
// route: /patient/age/:age
// description: To get all patient with 'age'
// parameter: age 
app.get("/patient/age/:age", async (req, res) => {
    try {
        const { age } = req.params;
        const patient = await patientModel.find({Age: age});
        if (!patient){
            return res.json({message: "No patient found"});
        }   
        return res.json ({ patient });
    } 
    catch(error) {
        return res.status(500).json({error: error.message});
    }
    
});


app.get("/login", async (req, res) => {
    try {
        const body = req.query;
        const pass = body.pass;
        const user = body.user;

        const patient_pass = await crypto("sha256", secret).update(pass).digest("hex");
        
        const patient = await patientModel.find({pass: patient_pass});
        
        //console.log(patient == []);
        const check = (patient == []);
        
        if (!check){    
            const valpass = patient[0].pass;
            const valuser = patient[0].user;   
            
            if ((valpass == patient_pass) && (valuser == user)){
                return res.json ({ patient });
            }
            else{
                return res.json({message: "Incorrect Username or Password"});
            }
        }   
        else{
            return res.json({message: "Incorrect Username or Password"});
        }    
        
        return res.json (patient);
        //return res.json ({ patient });
    } 
    catch(error) {
        
        return res.status(500).json({error: error.message});
    }
    
});


// POST
// route: /patient/new
// description: To add new patient
// parameter: none 
// request body: patient object
app.post("/patient/new", async(req, res) => {

    try{
        const { newpatient } = req.body;
        await patientModel.create(newpatient);
        const { _id } = req.params;
        return res.json({message: "Patient Created", _id: _id});
    } 
    catch(error){
        return res.status(500).json({error: error.message});
    }
    
});

// PUT
// route: /patient/update/:_id
// description: To update a patient
// parameter: _id 
// request body: patient object
app.put("/patient/update/:_id", async (req, res) => {

    try {
        const { _id } = req.params;
        const { patientData } = req.body;
        const updatepatient = await patientModel.findByIdAndUpdate(
            _id,
            { $set: patientData},
            { new: true}     
        );
        return res.json({patient: updatepatient});  
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
       
});


// DELETE
// route: /patient/delete/:_id
// description: To delete a patient
// parameter:  
// request body: none
app.delete("/patient/delete/:_id", async (req, res) => {
    try{
        const { _id } = req.params;
        await patientModel.findByIdAndDelete(_id);
        return res.json({message: "patient Deleted ????"});
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
    
});


// route: /patient/delete/name/:name
// description: To delete a patient with name
// parameter: name
// request body: none
app.delete("/patient/delete/name/:name", async (req, res) => {
    try {
        const { name } = req.params;
    await patientModel.findOneAndDelete({ name });
    return res.json({message: "patient Deleted ????"})
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
    
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => connectDB()
    .then(() => console.log("Server is Running ????"))
    .catch((error) => console.log(error)) 
);
