const mongoose = require('mongoose');
const Naturopath = require('../models/naturopath');
const cities = require('./cities');
const { descriptors, illnesses, firstNames, lastNames} = require('./seedHelper');


//connect to our mongoose model
mongoose.connect('mongodb://localhost:27017/naturopathFinder', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

//check for error when connecting to database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connnection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}


const seedDB = async() => {
    await Naturopath.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const naturo = new Naturopath({
            name: `${sample(firstNames)} ${sample(lastNames)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state }`,
            description: `${sample(descriptors)} ${sample(illnesses)}`,
            image: "https://source.unsplash.com/collection/3530573/1000x600"
         });
         await naturo.save()
    }
    
    
}

seedDB().then(() => {
    mongoose.connection.close()
});