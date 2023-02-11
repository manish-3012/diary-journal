//jshint esversion:6

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://zephyr007:Sahum6703%40@cluster0.cjacmuw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function main(){
  try{
    await client.connect();
    await fetchAll(client);
  } catch(e){
    console.error(e);
  } finally{
    // client.close()
  }
}

main().catch(console.error);

var postsDB;
async function fetchAll(client){
  const cursor = await client.db("blog").collection("posts").find();

  postsDB = await cursor.toArray();
  // console.log(postsDB);
}

async function insertNew(client, newItem){
  await client.db("blog").collection("posts").insertOne(newItem);
  fetchAll(client);

  console.log(`${postsDB.insertedCount} New listing created with the following id(s): `);
  console.log(postsDB.insertedIds);
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
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get("/",async function(req,res){

  await fetchAll(client);
  
  res.render("home",{content:homeStartingContent, items:postsDB});
});

app.get("/about",function(req,res){
  res.render("about",{content:aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{content:contactContent});
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose", async function(req,res){
  const newTitle = req.body.postTitle;
  const newBody = req.body.postBody;
  
  await insertNew(client,{
    title: newTitle,
    body: newBody
  });
  res.redirect("/");
});

// whenever we will open localhost:3000/postsDB/manish
// manish will be printed in the console as postName will be manish
app.get("/posts/:postId",function(req,res){
  
  // console.log(req.params);
  const requestedId = _.lowerCase(req.params.postId);
  
  // console.log(postsDB);
  for (let i = 0; i < postsDB.length; i++) {
    const storedId = _.lowerCase(postsDB[i]._id);
    // console.log(storedTitle);
    
    if(requestedId === storedId){
      res.render("post",{title:postsDB[i].title, body:postsDB[i].body, id: postsDB[i]._id});
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