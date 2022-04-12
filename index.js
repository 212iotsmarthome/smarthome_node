const express = require("express");
const req = require("express/lib/request");
const { json } = require("express/lib/response");
const res = require("express/lib/response");
// var localIpV4Address = require("local-ipv4-address");
// const cors = require("cors");
const mqtt = require("mqtt");
const app = express();
const port = 3003;

app.use(express.json());

// localIpV4Address().then(function (ipAddress) {
//   console.log("My IP address is " + ipAddress);
//   // My IP address is 10.4.4.137
// });

const username = "namdiep239";
const LEDtopic = "namdiep239/feeds/bbc-led",
  ACtopic = "namdiep239/feeds/bbc-conditioner",
  Buzztopic = "namdiep239/feeds/bbc-buzzer",
  Curtopic = "namdiep239/feeds/bbc-curtain",
  Doortopic = "namdiep239/feeds/bbc-door",
  Sensortopic = "namdiep239/feeds/bbc-sensor";

var jsonModel = require("./model.json");
var LED = jsonModel.led,
  AC = jsonModel.ac,
  Buzzer = jsonModel.buzzer,
  Curtain = jsonModel.curtain,
  Door = jsonModel.door,
  Sensor = jsonModel.sensor;

// MQTT connect
var client = mqtt.connect("mqtts://io.adafruit.com", {
  port: 8883,
  username: username,
  password: "aio_cSFh41uOGJgJ3IyiK0f0evTUtDOw",
});

client.on("connect", () => {
  console.log("Connected");
  client.subscribe([LEDtopic], () => {
    console.log(`Subscribe to topic '${LEDtopic}'`);
  });
  client.subscribe([ACtopic], () => {
    console.log(`Subscribe to topic '${ACtopic}'`);
  });
  client.subscribe([Buzztopic], () => {
    console.log(`Subscribe to topic '${Buzztopic}'`);
  });
  client.subscribe([Curtopic], () => {
    console.log(`Subscribe to topic '${Curtopic}'`);
  });
  client.subscribe([Doortopic], () => {
    console.log(`Subscribe to topic '${Doortopic}'`);
  });
  client.subscribe([Sensortopic], () => {
    console.log(`Subscribe to topic '${Sensortopic}'`);
  });
});

// Publish on AdafruitIO via MQTT
function writeMQTT(topic, str) {
  client.publish(topic, str, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

// Listen with React Native
app.listen(port, () => {
    console.log("Server is running on port " + port);
});

// PUT request
app.put("/controlDoor", (req, res) => {
  const id = req.body.id;
  const boardId = req.body.boardId;
  const isLocked = req.body.isLocked ? 1 : 0;
  const isOpen = req.body.isOpen ? 1 : 0;
  console.log(id, isLocked, isOpen);

  Door[boardId][id]["motor"] = isOpen;
  Door[boardId][id]["lock"] = isLocked;

  res.send("Received control door req");
  writeMQTT(Doortopic, JSON.stringify(Door));
});

app.put("/controlAlarm", (req, res) => {
  const id = req.body.id;
  const boardId = req.body.boardId;
  const value = req.body.value;
  console.log(id, boardId, value);

  Buzzer[boardId][id] = value;

  res.send("Received control alarm req: " + id + " " + isOn);
  writeMQTT(Buzztopic, JSON.stringify(Buzzer));
});

app.put("/controlCurtain", (req, res) => {
  const id = req.body.id;
  const boardId = req.body.boardId;
  const action = req.body.action; // 0: close, 1:half, 2:full
  console.log(id, boardId, action);

  //Change Curtain value
  Curtain[boardId][id] = action;

  // Write to Ada
  res.send("Received control curtain req: " + id + " " + action);
  writeMQTT(Curtopic, JSON.stringify(Curtain));
});

app.put("/controlLED", (req, res) => {
  const id = req.body.id;
  const boardId = req.body.boardId;
  const value = req.body.value;
  console.log(id, boardId, value);

  //Change LED value
  LED[boardId][id] = value;

  // Write to Ada
  res.send("Received control LED req: " + boardId + " " + id + " " + value);
  writeMQTT(LEDtopic, JSON.stringify(LED));
});

app.put("/controlAC", (req, res) => {
  const id = req.body.id;
  const boardId = req.body.boardId;
  const power = req.body.power ? 1 : 0;
  const temp = req.body.temp;
  console.log(boardId, id, power, temp);

  //Change AC value
  AC[boardId][id]["power"] = power;
  AC[boardId][id]["temp"] = temp;

  // Write to Ada
  res.send("Received control AC req: " + id + " " + power + " " + temp);
  writeMQTT(ACtopic, JSON.stringify(AC));
});

// GET request
app.get('/getEnviStatus', (req, res) => {
    const index = req.query.index;
    const boardID = req.query.boardId;
    console.log(req.query);
    let type = '';
    switch(req.query.typ){
        case '3':
            type = 'DHT11';
            break;
        case '4':
            type = 'LDR';
            break;
        case '5':
            type = 'gas';
            break;
    }
    console.log(type);
    try{
      res.send(Sensor[boardID][type][index]);
    }
    catch(err){
      console.log(err);
    }
})

app.get('/getLED', (req, res) => {
  const boardID = req.query.boardID
  const index = req.query.index
  res.send({ value: LED[boardID][index] })
  // res.send(LED.boardID.index)
})

app.get('/getAC', (req, res) => {
  const boardID = req.query.boardID
  const index = req.query.index
  res.send({ value: AC[boardID][index] })
})

app.get('/getDoor', (req, res) => {
  const boardID = req.query.boardID
  const index = req.query.index
  res.send({ value: Door[boardID][index] })
})

app.get('/getCurtain', (req, res) => {
  const boardID = req.query.boardID
  const index = req.query.index
  res.send({ value: Curtain[boardID][index] })
})

client.on("message", (topic, message) => {
  if (topic === LEDtopic) {
    LED = JSON.parse(message);
    console.log(LED);
  }
  if (topic === ACtopic) {
    AC = JSON.parse(message);
    console.log(AC);
  }
  if (topic === Buzztopic) {
    Buzzer = JSON.parse(message);
    console.log(Buzzer);
  }
  if (topic === Curtopic) {
    Curtain = JSON.parse(message);
    console.log(Curtain);
  }
  if (topic === Doortopic) {
    Door = JSON.parse(message);
    console.log(Door);
  }
  if (topic === Sensortopic) {
    Sensor = JSON.parse(message);
    console.log(Sensor);
  }
});

// LED: {"board1":{"0":0,"1":0}}
// AC: {"board1":{"0":{"power":0,"temp":25}}}
// Buzzer: {"board1":{"0":0}}
// Envi: {"board1":{"DHT11":{"0":{"humid":64.0,"temperature":31.8}},"LDR":{"1":89,"2":120},"gas":{"0":0}}}
// Door: {"board1":{"0":{"motor":1,"lock":0}}}
// Curtain: {"board1":{"0":0}}

// DHT11: ẩm/nhiệt
// LDR: ánh sáng
// Gas: khí ga
