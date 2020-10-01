const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-Vedant:VeSa%232001@cluster0.zy2bu.mongodb.net/creditManagement', {useNewUrlParser: true});
//mongoose.connect("mongodb://localhost:27017/creditManagement",{useNewUrlParser: true});
//mongoose.connect('mongodb+srv://admin-USERNAME:PASSWORD1@cluster0.zy2bu.mongodb.net/creditManagement', {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  credit: Number
});
const transferSchema = new mongoose.Schema({
  from:String,
  fromName: String,
  toName: String,
  Transfered: Number,
  transferedTime:String
});
var User = mongoose.model('User', userSchema);
var Transfer = mongoose.model('Transfer', transferSchema);

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
    var event = new Date();
    var ev= event.toLocaleString('en-US');
    Transfer.create({from:from,fromName:fromName,toName: tooName,Transfered: points,transferedTime:ev},function(err,res){
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
