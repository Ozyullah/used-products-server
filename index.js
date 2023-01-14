const express =require('express')
const cors =require('cors')
require('dotenv').config()


const app =express();
const port =process.env.PORT || 4000;

app.use(cors());
app.use(express.json());


app.get('', (req, res)=>{
    res.send('Used products server is started')
})

app.listen(port,()=>{
    console.log(`used products server start on: ${port}`)
})