const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = 2000;
const app = express();
app.use(express.json())
// connect to db
mongoose.connect('mongodb://localhost:27017/formateursdb')
.then(()=>console.log('db connected'))
.catch((err)=>console.log('error : ',err))

// schema
const ForamteursSchema = new mongoose.Schema({
    email : {type:String,unique:true},
    name : String,
    password : String,
})

const Formateur = mongoose.model('formateurs',ForamteursSchema)
//  register route
app.post('/formateurs/register', async(req,res)=>{
    try{
        const {email,name,password} = req.body;
        // verifier l'existance
        const ExestingFormateur = await Formateur.findOne({email})
        if(ExestingFormateur){
            return res.json({error : `formateur already exists`})
        }
        // hacher le password
        const HachedPassword = await bcrypt.hash(password,10);
        const NewFormateur = new Formateur({email,name,password:HachedPassword});
        await NewFormateur.save();
        res.json({message : 'formateur registered successfully'})
    }catch(err){
        console.log(err)
        res.json({error : err})
    }
}) 
 
// login route
app.get('/formateurs/login',async(req,res)=>{
    try{
        const {email,name,password} = req.body;
        const formateur = await Formateur.findOne({email,name});

        if(!formateur){
            res.json({message:'formateur not exists'})
        }

        // verifier le mot de passe
        const VerfierPassword = await bcrypt.compare(password,formateur.password)
        if(!VerfierPassword){
            res.json({message : 'incorrect password'});
        }

        // JWT
        const jwetoken = jwt.sign({email:formateur.email},'FST_KEY',{ expiresIn: '24h' })
        res.json({"json web token" : jwetoken})
    }catch(err){
        console.log(err)
        res.json({error : err})
    }
})

app.listen(PORT,()=>{
    console.log(`server runing in the port ${PORT}`);
})