//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Bhuvan1012:test123@cluster0-xmrbb.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "This is a to do list."
});

const item2 = new Item({
  name: "Hit + to add a new item"
});

const item3 = new Item({
  name: "Check off the item to remove from the list"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find({}, function(err, founditems) {
    if (err) {
      console.log(err);
    } else {
      if (founditems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Added successfully!");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: founditems
        });
      }
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName}, function(err, customList) {
    if (!customList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.render("list", {listTitle: list.name, newListItems: list.items});
    } else {
      res.render("list", {listTitle: customList.name , newListItems: customList.items});
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
      }
    });
    res.redirect("/"+listName);
  }


});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkedItem;
  const listName = req.body.listName;

  if(listName ==="Today"){
    Item.findByIdAndDelete({
      _id: checkedItemId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted!");
      }
    });
    res.redirect("/");
  }else{
    // Method-1

    // List.findOne({name:listName},function(err,foundList){
    //   if(!err){
    //     foundList.items.pop(foundList.checkedItemId);
    //     foundList.save();
    //   }
    // });

    //Method-2

    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}}, function(err,foundList){
      if(!err){
          res.redirect("/"+listName);
      }
    });
  }
});



app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server active!");
});
