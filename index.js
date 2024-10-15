import express from "express";
import bodyParser from "body-parser";//bp
import pg from "pg";//pg
import 'dotenv/config';
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));//use for taking in static files

const db = new pg.Client({//env variables
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
})
db.connect();



let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM items ORDER BY ID ASC");//select all items and order ascending id (orders like a queue)
    items=result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
}
  catch(err){
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  try{
    await db.query("INSERT INTO items (title) VALUES ($1)" , [item]);//inserts req item into items db
    res.redirect("/");//sends user back to /
    
  }
  catch (err){
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try{
    await db.query("UPDATE items set title = ($1) WHERE id = $2" , [item,id])//UPDATE item query item where id is equal to the request id
  }
  catch (err){
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id=req.body.deleteItemId;
  try{
    await db.query("DELETE FROM items WHERE id = $1" , [id]);//DELETE query item where id is equal to requested id for deletion
    res.redirect("/");
  }
  catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
