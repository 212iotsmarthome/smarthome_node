const mqtt = require('mqtt');
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

var my_topic = "NoviceKnight/feeds/bbc-led";

var client = mqtt.connect('mqtts://io.adafruit.com',{
    port: 8883,
    username: 'NoviceKnight',
    password: 'aio_AcjG93j5dQMnFOnzyW7jjqp0uCtb'
});


var LED, AC, Buzzer, Curtain, Door, Sensor;

client.on('connect', () => {
    console.log('Connected');
    // client.subscribe([LEDtopic], () => {
    //     console.log(`Subscribe to topic '${LEDtopic}'`)
    // });
    // client.subscribe([ACtopic], () => {
    //     console.log(`Subscribe to topic '${ACtopic}'`)
    // });
    // client.subscribe([Buzztopic], () => {
    //     console.log(`Subscribe to topic '${Buzztopic}'`)
    // });
    // client.subscribe([Curtopic], () => {
    //     console.log(`Subscribe to topic '${Curtopic}'`)
    // });
    // client.subscribe([Doortopic], () => {
    //     console.log(`Subscribe to topic '${Doortopic}'`)
    // });
    // client.subscribe([Sensortopic], () => {
    //     console.log(`Subscribe to topic '${Sensortopic}'`)
    // });
    client.subscribe([my_topic], () => {
        console.log(`Subscribe to topic '${my_topic}'`)
    });
});

// function updateLED(boardId, Id, value){
//     LED[boardId][Id] = value;
//     writeMQTT(my_topic, LED.toString());
// }

function writeMQTT(topic, str){
    client.publish(topic, str, { qos: 0, retain: false }, (error) => {
        if (error) {
          console.error(error)
        }
    })
}

client.on('error', (error) => {
    console.log('MQTT Client Errored');
    console.log(error);
});

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
        console.log(JSON.parse(message));
    }
})

// LED: {"board1":{"0":0,"1":0}}
// AC: {"board1":{"0":{"power":0,"temp":25}}}
// Buzzer: {"board1":{"0":0}}
// Envi: {"board1":{"DHT11":{"0":{"humid":64.0,"temperature":31.8}},"LDR":{"1":89,"2":120},"gas":{"0":0}}}
// Door: {"board1":{"0":{"motor":1,"lock":0}}}
// Curtain: {"board1":{"0":0}}

//DHT11: ẩm/nhiệt
// LDR: ánh sáng
// Gas: khí ga

// writeMQTT(my_topic , "{\"board1\":{\"0\":0,\"1\":0}}");
// // updateLED("board1","1", 1);

// app.listen(3000, () => {console.log("Listening...")});


