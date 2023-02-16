const express =require('express')
const cors =require('cors')
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SK)
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
        const advertisedCollection =client.db("usedProducts").collection("advertised")
        const paymentsCollection =client.db("usedProducts").collection("payments")

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


        app.get('/productsDetails/:id', async(req, res)=>{
        
            const id =req.params.id;

            const query ={ _id: ObjectId(id)}

            console.log(query)

            const laptopsOne =await itemsCollections.findOne(query);
            // const infoeCatagory =await laptopsOne.toArray();
            // console.log(infoe)
            res.send(laptopsOne)
        })

        // Products details update 

        app.put('/productsDetailsRole/:id', async(req,res)=>{
            const id =req.params.id

            const filter ={ _id: ObjectId(id)}
            const options = { upsert: true}
            const updatedDoc ={
                $set:{
                    role:"reported"
                }
            }
            const result =await itemsCollections.updateOne(filter, updatedDoc, options);
            res.send(result)
        })

        // Reported data Loading

        app.get('/reportedData', async(req,res)=>{
            let query ={}

            if(req.query.role){
                query={
                    role: req.query.role
                }
            }

            const solution =await itemsCollections.find(query).toArray()
            res.send(solution)
        })


        // product booking sector

        app.post('/booking', async(req, res)=>{
            const booking=req.body;
            const result=await bookingDataCollections.insertOne(booking);
            res.send(result)
        })

        app.get('/bookingQuantity', async(req,res)=>{
            let query={}
            if(req.query.products_name || req.query.email){
                query = {
                    products_name: req.query.products_name,
                }
                query = {
                    email: req.query.email
                }
            }
            const result =await bookingDataCollections.find(query).toArray()
            res.send(result);
        });

        // Id based booking load system

        app.get('/booking/payment/:id', async(req, res)=>{
            const id =req.params.id
            const query ={ _id: ObjectId(id)}
            const result =await bookingDataCollections.findOne(query)
            res.send(result)
        })


        // Payments section start

        app.post('/create-payment-intent', async(req, res)=>{
            const booking =req.body;
            const price=booking.products_price;
            const amount =price * 100

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "BDT",
                amount: amount,
                "payment_method_types": [
                    "card"
                  ],
            });
    
            res.send({
                clientSecret: paymentIntent.client_secret,
              })
        });


        app.post('/payments', async(req, res)=>{
            const payoff =req.body;
            const result =await paymentsCollection.insertOne(payoff);

            const id =payoff.bookingID
            const filter = { _id: ObjectId(id)}
            const updatedDoc ={
                $set:{
                    paid: 'succesfull',
                    transactionId: payoff.trangectioneID
                }
            }
            const advanceResult =await bookingDataCollections.updateOne(filter, updatedDoc)
            res.send(result)
        })


        // Advertised sector start
        app.post('/advertise', async(req,res)=>{
            const item =req.body
            const result = await advertisedCollection.insertOne(item);
            res.send(result);
        })


        app.get('/advertising', async(req, res)=>{
            const query={}
            const qualification =await advertisedCollection.find(query).toArray()
            res.send(qualification)
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


        // myProducts sector start
        app.get('/products', async(req,res)=>{
            let query={}
            if(req.query.email){
                query={
                    email:req.query.email
                }
            }
            const result =await itemsCollections.find(query).toArray();
            res.send(result)
        })

        // Products delete from My products

        app.delete('/productsDelete/:id', async(req, res)=>{
            const id =req.params.id;
            const query ={ _id: ObjectId(id)}
            const result =await itemsCollections.deleteOne(query)
            res.send(result)
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