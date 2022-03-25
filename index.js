const express = require('express');
const cors = require("cors");
const mqtt = require('mqtt');
const app = express();
const port = 3002;

app.use(express.json());

const username = 'namdiep239';
const   LEDtopic = 'namdiep239/feeds/bbc-led', 
        ACtopic = 'namdiep239/feeds/bbc-conditioner', 
        Buzztopic = 'namdiep239/feeds/bbc-buzzer', 
        Curtopic = 'namdiep239/feeds/bbc-curtain', 
        Doortopic = 'namdiep239/feeds/bbc-door', 
        Sensortopic = 'namdiep239/feeds/bbc-sensor';

var LED = {}, AC = {}, Buzzer = {}, Curtain = {}, Door = {}, Sensor = {};

// MQTT connect
var client = mqtt.connect('mqtts://io.adafruit.com',{
    port: 8883,
    username: username,
    password: 'aio_cSFh41uOGJgJ3IyiK0f0evTUtDOw',
});

client.on('connect', () => {
    console.log('Connected');
    client.subscribe([LEDtopic], () => {
        console.log(`Subscribe to topic '${LEDtopic}'`)
    });
    client.subscribe([ACtopic], () => {
        console.log(`Subscribe to topic '${ACtopic}'`)
    });
    client.subscribe([Buzztopic], () => {
        console.log(`Subscribe to topic '${Buzztopic}'`)
    });
    client.subscribe([Curtopic], () => {
        console.log(`Subscribe to topic '${Curtopic}'`)
    });
    client.subscribe([Doortopic], () => {
        console.log(`Subscribe to topic '${Doortopic}'`)
    });
    client.subscribe([Sensortopic], () => {
        console.log(`Subscribe to topic '${Sensortopic}'`)
    });
});

// Publish on AdafruitIO via MQTT
function writeMQTT(topic, str){
    client.publish(topic, str, { qos: 0, retain: false }, (error) => {
        if (error) {
          console.error(error)
        }
    })
}

// Listen with React Native
app.listen(3002, () => {
    console.log("Server is running on port 3002");
});

// PUT request
app.put('/controlDoor', (req, res) => {
    const id = req.body.id;
    const isLocked = req.body.isLocked;
    const isOpen = req.body.isOpen;
    console.log(id, isLocked, isOpen);
    res.send("Received control door req");
})

app.put('/controlAlarm', (req, res) => {
    const id = req.body.id;

    const boardId = req.body.boardId;
    const value = req.body.value;
    console.log(id, boardId, value);
 
    Buzzer[boardId][id] = value;

    res.send("Received control alarm req: " + id + " " + isOn);
    writeMQTT(Buzztopic, JSON.stringify(Buzzer));
})

app.put('/controlCurtain', (req, res) => {
    const id = req.body.id;
    const action = req.body.action; // 0: close, 1:half, 2:full
    console.log(id, action);
    res.send("Received control curtain req: " + id + " " + action);

})

app.put('/controlLED', (req, res) => {
    const id = req.body.id;
    const boardId = req.body.boardId;
    const value = req.body.value;
    console.log(id, boardId, value);

    //Change LED value
    LED[boardId][id] = value;
    
    // Wtite to Ada
    res.send("Received control LED req: " + boardId + " " + id + " " + value);
    writeMQTT(LEDtopic, JSON.stringify(LED));

})

app.put('/controlAC', (req, res) => {
    const id = req.body.id;
    const boardId = req.body.boardId;
    const power = req.body.power;
    const temp = req.body.temp;
    console.log(id, isOn, temp);

    AC[boardId][id]["power"] = power;
    AC[boardId][id]["temp"] = temp

    res.send("Received control AC req: " + id + " " + isOn + " " + temp);
    writeMQTT(ACtopic, JSON.stringify(AC));
})

// app.post('/addDevice', (req, res) => {
//     const code = req.body.code;
//     const name = req.body.dName;
//     console.log(code, name);
//     res.send("Add device successfully");
// })

client.on('message', (topic, message) => {
    if (topic === LEDtopic) {
        LED = JSON.parse(message);
    }
    if (topic === ACtopic) {
        AC = JSON.parse(message);
    }
    if (topic === Buzztopic) {
        Buzzer = JSON.parse(message);
    }
    if (topic === Curtopic) {
        Curtain = JSON.parse(message);
    }
    if (topic === Doortopic) {
        Door = JSON.parse(message);
    }
    if (topic === Sensortopic) {
        Sensor = JSON.parse(message);
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

