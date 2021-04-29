const mongoose = require ("mongoose");
mongoose.connect(process.env.DATABASE_CONN,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log(`Connection Successful !`);
}).catch((err)=>{
    console.log(`No Connection`);
})