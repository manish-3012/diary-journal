require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function main() {
  try {
    await client.connect();
    await fetchAll(client);
  } catch (e) {
    console.error(e);
  } finally {
    // client.close()
  }
}

main().catch(console.error);

var postsDB;

async function fetchAll(client) {
  const cursor = await client.db("blog").collection("posts").find();

  postsDB = await cursor.toArray();
}

async function insertNew(client, newItem){
  await client.db("blog").collection("posts").insertOne(newItem);
  fetchAll(client);
}

async function insertNewRegex(client, newItem){
  await client.db("blog").collection("registration").insertOne(newItem);
  fetchAll(client);
}

async function insertNewPayex(client, newItem){
  await client.db("blog").collection("payerDetails").insertOne(newItem);
  fetchAll(client);
}

async function insertNewUser(client, newItem){
  await client.db("blog").collection("reviews").insertOne(newItem);
}

async function deleteFromDB(client, postTitleToDel){
  var result = await client.db("blog").collection("posts").deleteOne({title:postTitleToDel});
  
  console.log(result);
}

const express = require("express");
const ejs = require("ejs");

// to import the lodash module
const _ = require("lodash");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const scheduleContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const registrationContent = "Your registration content goes here...";

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));

app.get("/",async function(req,res){

  await fetchAll(client);
  
  res.render("home",{content:homeStartingContent, items:postsDB});
});

app.get("/schedule",function(req,res){
  res.render("schedule",{content:scheduleContent});
});

app.get("/chhindwara",function(req,res){
  res.render("chhindwara",{content:scheduleContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{content:contactContent});
});

app.post("/contact", async function(req,res){
  const newName = req.body.userName;
  const newMail = req.body.userMail;
  const newMessage = req.body.userMessage;
  
  await insertNewUser(client,{
    name: newName,
    mail: newMail,
    message: newMessage
  });
  res.redirect("/");
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.get("/confirmation", function (req, res) {
  // You can render the confirmation view without any dynamic data if needed
  res.render("confirmation");
});

app.post("/compose", async function(req,res){
  if(req.body.key === "JSM2023"){
    const newTitle = req.body.postTitle;
    const newAuthor = req.body.author;
    const newBody = req.body.postBody;
    
    await insertNew(client,{
      title: newTitle,
      body: newBody,
      author: newAuthor
    });
  }
  res.redirect("/");
});

// Assuming you have a route like this in your app.js or index.js
app.get("/registration", function (req, res) {
  // You can set default values or calculate them based on your logic
  const numAdults = 0; // Replace with your actual value or calculation
  const numBals = 0; // Replace with your actual value or calculation
  const numYuvas = 0; // Replace with your actual value or calculation
  const totalAmount = 0; // totalAmount to be paid

  res.render("registration", { content: registrationContent, numAdults, numYuvas, numBals, totalAmount });
});

let registrationCount = 0;
app.post("/registration", async function (req, res) {
  const numAdults = parseInt(req.body.numAdults, 10);
  const numYuvas = parseInt(req.body.numYuvas, 10);
  const numBals = parseInt(req.body.numBals, 10);

  const yuvaDetails = [];
  const adultDetails = [];
  const balDetails = [];

  // Loop through and save yuva details
  for (let i = 1; i <= numYuvas; i++) {
    const yuvaName = req.body[`yuvaName${i}`];
    const yuvaAadhar = req.body[`yuvaAadhar${i}`];
    const yuvaGender = req.body[`yuvaGender${i}`];

    yuvaDetails.push({ name: yuvaName, aadharNo: yuvaAadhar, gender: yuvaGender });
  }

  // Loop through and save adult details
  for (let i = 1; i <= numAdults; i++) {
    const adultName = req.body[`adultName${i}`];
    const adultAadhar = req.body[`adultAadhar${i}`];
    const adultGender = req.body[`adultGender${i}`];

    adultDetails.push({ name: adultName, aadharNo: adultAadhar, gender: adultGender });
  }

  // Loop through and save bal details
  for (let i = 1; i <= numBals; i++) {
    const balName = req.body[`balName${i}`];
    const balAadhar = req.body[`balAadhar${i}`];
    const balGender = req.body[`balGender${i}`];

    balDetails.push({ name: balName, aadharNo: balAadhar, gender: balGender });
  }

  let uniqueEnrollmentNumber = generateUniqueEnrollmentNumber();

  let payerDetails = {
    firstName: req.body.payerFirstName,
    lastName: req.body.payerLastName,
    mobileNo: req.body.payerMobile,
    email: req.body.payerEmail,
    state: req.body.payerState,
    district: req.body.payerDistrict,
    pincode: req.body.payerPincode,
    panNo: req.body.payerPAN,
  };
  
  // console.log(payerDetails);

  // console.log(req.body);
  
  try {
    registrationCount++;
    let uniqueEnrollmentNumber = generateUniqueEnrollmentNumber(registrationCount);
    
    await insertNewRegex(client, {
      adults: adultDetails,
      yuvas: yuvaDetails,
      bals: balDetails,
      payerDetails: payerDetails,
      uniqueEnrollmentNumber: uniqueEnrollmentNumber,
      utrNumber:req.body.utrNumber,
      totalAmount:req.body.totalAmount
    });

    await insertNewPayex(client, {
      payerDetails: payerDetails,
      uniqueEnrollmentNumber: uniqueEnrollmentNumber,
      utrNumber:req.body.utrNumber,
      totalAmount:req.body.totalAmount
    });

    res.render("confirmation", { uniqueEnrollmentNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 
app.get("/:postId",async function(req,res){
  
  // console.log(req.params);
  const requestedId =  _.lowerCase(req.params.postId);
  await fetchAll(client);
  
  // console.log(postsDB);
  for (let i = 0; i < postsDB.length; i++) {
    const storedId = _.lowerCase(postsDB[i]._id);
    // console.log(storedTitle);
    
    if(requestedId === storedId){
      res.render("post",{title:postsDB[i].title, body:postsDB[i].body, id: postsDB[i]._id, author:postsDB[i].author});
    }
    
  }
});

app.post("/delete",async function(req,res){
  var postTitleToDel = req.body.del;
  
  await deleteFromDB(client,postTitleToDel);
  res.redirect("/");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

function generateUniqueEnrollmentNumber(count) {
  // Convert the count to an ordinal number
  const ordinalNumber = getOrdinalNumber(count);
  return ordinalNumber + ' registration';
}

// Function to convert a number to an ordinal number (1st, 2nd, 3rd, etc.)
function getOrdinalNumber(number) {
  const suffixes = ["st", "nd", "rd"];
  const remainder = number % 10;
  const suffix = suffixes[remainder - 1] || "th";
  return number + suffix;
}