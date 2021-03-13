const express=require("express");
const connectDB=require('./config/db');
var cors = require('cors')
 
const app=express();
connectDB();



app.use(express.json({extended:false}));
app.use(cors())

//app.use('/api/profile',require('./routes/api/profile'));
app.get('/check',(req,res) => res.send('Working'));
app.use('/api/user',require('./routes/api/users'));

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`server is starting ${PORT}`))
