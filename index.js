const express =require('express')
const cors =require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app =express();
const port =process.env.PORT || 4000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vkwd2pr.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
    try{
        const dataCollections =client.db("usedProducts").collection("catagory")
        const itemsCollections =client.db("usedProducts").collection("products")
        const bookingDataCollections=client.db("usedProducts").collection("conservation")
        const webReviewsCollections=client.db("usedProducts").collection("webreviews")
        const usersCollection =client.db("usedProducts").collection("users")

        app.get('/catagory', async(req, res)=>{
                const query= {}
                const result =dataCollections.find(query);
                const data=await result.toArray()
                res.send(data)
        });


        app.get('/catagory/:id', async(req, res)=>{
        
            const id =req.params.id;

            const query ={ catagory_id:(id)}

            const laptops = itemsCollections.find(query);
            const infoe =await laptops.toArray();
            // console.log(infoe)
            res.send(infoe)
        })


        // product booking sector

        app.post('/booking', async(req, res)=>{
            const booking=req.body;
            const result=await bookingDataCollections.insertOne(booking);
            res.send(result)
        })


        // Review section added

        app.post('/review', async(req, res)=>{
            const review =req.body;
            const opinion =await webReviewsCollections.insertOne(review);
            res.send(opinion)
        });

        app.get('/allreviews', async(req, res)=>{
            const query ={}
            const views =await webReviewsCollections.find(query).toArray();
            res.send(views);
        });
        

        // User Collection sector

        app.post('/users', async(req, res)=>{
            const addUser =req.body;
            const collected =await usersCollection.insertOne(addUser);
            res.send(collected)
        });

        app.get('/users', async(req, res)=>{
            const query ={}
            const getUsers =await usersCollection.find(query).toArray();
            res.send(getUsers)
        });

        // Create user Admin
        app.put('/users/admin/:id', async(req, res)=>{
            const id =req.params.id;
            const filter ={ _id: ObjectId(id)}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // User Remove sector

        app.delete('/users/delete/:id', async(req, res)=>{
            const id =req.params.id;
            const query ={ _id: ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        // All Seller sector 

        app.get('/sellers', async(req, res)=>{
            let query = {};

            if(req.query.role){
                query = {
                    role: req.query.role
                }
            }
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        // Seller Verification sector

        app.put('/users/verify/:id', async(req,res)=>{
            const id =req.params.id
            const filter ={ _id: ObjectId(id)}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quality: 'varifyed'
                }
            }
            const result =await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })


        // Add products sector
        app.post('/product', async(req,res)=>{
            const addProduct =req.body;
            const productCollected =await itemsCollections.insertOne(addProduct);
            res.send(productCollected)
        })

        // Get all products
        app.get('/allProducts', async(req,res)=>{
            const query={}
            const goods =await itemsCollections.find(query).toArray();
            res.send(goods)
        })
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Used products server is started')
})

app.listen(port,()=>{
    console.log(`used products server start on: ${port}`)
})