const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-Vedant:VeSa%232001@cluster0.zy2bu.mongodb.net/creditManagement', {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  credit: Number
});
const transferSchema = new mongoose.Schema({
  from:String,
  fromName: String,
  toName: String,
  Transfered: Number
});
var User = mongoose.model('User', userSchema);
var Transfer = mongoose.model('Transfer', transferSchema);

// User.insertMany([{name:"Arjun" , email:"arjun01@gmail.com" , credit:50 },{name:"Riya" , email:"sharma.riya@gmail.com" , credit:405 },{name:"Kabir" , email:"kabir5925@mail.com" , credit:300 },
// {name:"Diya" , email:"diya@mail.com" , credit:250 },{name:"Aditya" , email:"adityagupta70@gmail.com" , credit:69 },{name:"Siddarth" , email:"siddshukla@mail.com" , credit:200 },
// {name:"Yash" , email:"yashsahu007@gmail.com" , credit: 420 },{name:"Naina" , email:"naina1995@mail.com" , credit:20 },{name:"Jyoti" , email:"jyotilbs@gmail.com" , credit:350 },
// {name:"Aditi" , email:"aditi@mail.com" , credit:40 }], function(error, docs) {
//   console.log(error);
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

var error = "";
var fromName,toName;
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/home.html");
})

app.post('/users',function(req,res){
  User.find({},function(err,result){
    if(!err){
        res.render(__dirname + "/users.ejs",{allUser:result , topHead:"Users" , btnName:"Open", postAdd:"/profile",from:""});
    }
  });

});

app.post('/alltransfers',function(req,res){
  Transfer.find({},function(err,result){
    if(!err){
        res.render(__dirname + "/allTransfer.ejs",{allTransfer:result});
    }
  });

});

var points=0;
var fromName;
app.post("/profile",function(req,res){
  profileId = req.body.id;
  fromName = req.body.naam;
  error="";
  User.findById(profileId,function(err,result){
    if(!err){
        res.render(__dirname + "/profile.ejs",{user:result , err:error});
    }
  });
});

app.post("/transfer",function(req,res){
  var profileId = req.body.id;
  points = req.body.points;
  error="";
  User.findById(profileId,function(err,result){
    if(!err){
        if(points>result.credit || points<=0){
          error = "Please enter correct amount.";
          res.render(__dirname + "/profile.ejs",{user:result , err:error});
        } else{
          User.find({_id: {$ne: profileId}},function(err,result){
            if(!err){
                res.render(__dirname + "/users.ejs",{allUser:result, topHead:"Transfer to..", btnName:"Transfer",postAdd:"/success",from:profileId});
            }
          });
        }
    }
})
});
app.post("/success",function(req,res){
  var from = req.body.from;
  var to = req.body.id;
  var error;
  var tooName =req.body.naam;

  User.findByIdAndUpdate(from, { $inc : { credit : -points } }, function(err){
    error = err;
    if(err)
      console.log(points);
  });
  User.findByIdAndUpdate(to, { $inc : { credit : points } },function(err){
    error = err;
    if(err)
      console.log(err);
  });
  if(!error){
    Transfer.create({from:from,fromName:fromName,toName: tooName,Transfered: points},function(err,res){
      if(err)
        console.log(err);
    });
    points=0;
    res.sendFile(__dirname + "/success.html");
  }

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Successfully started the server");
})
