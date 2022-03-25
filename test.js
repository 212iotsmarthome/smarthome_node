const express = require("express");
const cors = require("cors");
const mqtt = require('mqtt');
const app = express();
const port = 8000

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

const username = 'NoviceKnight';
const my_topic = "NoviceKnight/feeds/bbc-led";


var LED = {}, AC = {}, Buzzer = {}, Curtain = {}, Door = {}, Sensor = {};

// npm init
// npm i express cors nodemon
// they add a handy req.body object to our req,
// containing a Javascript
//  object representing the payload sent with the request

// const express = require('express');
// const app = express();
// app.use(express.json())

// var LEDtopic = 'namdiep239/feeds/bbc-led', 
//     ACtopic = 'namdiep239/feeds/bbc-conditioner', 
//     Buzztopic = 'namdiep239/feeds/bbc-buzzer', 
//     Curtopic = 'namdiep239/feeds/bbc-curtain', 
//     Doortopic = 'namdiep239/feeds/bbc-door', 
//     Sensortopic = 'namdiep239/feeds/bbc-sensor';


// var client = mqtt.connect('mqtts://io.adafruit.com',{
//     port: 8883,
//     username: 'namdiep239',
//     password: 'aio_cSFh41uOGJgJ3IyiK0f0evTUtDOw'
// });

var client = mqtt.connect('mqtts://io.adafruit.com',{
    port: 8883,
    username: 'NoviceKnight',
    password: 'aio_AcjG93j5dQMnFOnzyW7jjqp0uCtb'
});


client.on('connect', () => {
    console.log('Connected');
    client.subscribe([my_topic], () => {
        console.log(`Subscribe to topic '${my_topic}'`)
    });
});

function writeMQTT(topic, str){
    client.publish(topic, str, { qos: 0, retain: false }, (error) => {
        if (error) {
          console.error(error)
        }
    })
}

// app.get("/", cors(), async (req, res) => {
// 	res.send("This is working");
// })
// app.get("/api/v2/NoviceKnight/groups", cors(), async (req, res) => {
// 	res.send("This is the data for the home page");
// })

app.post("/post_name", async (req, res) => {
	let { name } = req.body;
	LED["board1"]["0"] = 1;
	writeMQTT(my_topic, JSON.stringify(LED));
})

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`)
})

client.on('message', (topic, message) => {
    // if (topic === LEDtopic) {
    //     LED = JSON.parse(message);
    //     console.log(LED);
    // }
    // if (topic === ACtopic) {
    //     AC = JSON.parse(message);
    //     console.log(AC);
    // }
    // if (topic === Buzztopic) {
    //     Buzzer = JSON.parse(message);
    //     console.log(Buzzer);
    // }
    // if (topic === Curtopic) {
    //     Curtain = JSON.parse(message);
    //     console.log(Curtain);
    // }
    // if (topic === Doortopic) {
    //     Door = JSON.parse(message);
    //     console.log(Door);
    // }
    // if (topic === Sensortopic) {
    //     Sensor = JSON.parse(message);
    //     console.log(Sensor);
    // }
    if (topic == my_topic){
        console.log(message);
        LED = JSON.parse(message);
    }
})