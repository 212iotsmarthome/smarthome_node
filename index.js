
const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { json } = require("express/lib/response");
const { getDocument, addDocument, editDocumentById, deleteDocumentById, addLog } = require("./config");
const mqtt = require("mqtt");
const cors = require("cors");
const app = express();
const port = 3003;
app.use(cors());
app.use(express.json());
// var localIpV4Address = require("local-ipv4-address");

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

const ScheduleInterval = 10;

var   jsonModel = require("./model.json");
var   LED = jsonModel.led,
      AC = jsonModel.ac,
      Buzzer = jsonModel.buzzer,
      Curtain = jsonModel.curtain,
      Door = jsonModel.door,
      Sensor = jsonModel.sensor;

var Schedules, Devices, Envis;

// Publish on AdafruitIO via MQTT
function writeMQTT(topic, str) {
  client.publish(topic, str, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

// Execute the Schedule
async function decodeAction (boardID, index, deviceID, sid, str){
  //LED
  if(str == 'Light off'){
    LED[boardID][index] = 0;
    writeMQTT(LEDtopic, JSON.stringify(LED));
    await addLog({
      content: "LED (#"+ deviceID + ") has been turned off by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Low brightness'){
    LED[boardID][index] = 1;
    writeMQTT(LEDtopic, JSON.stringify(LED));
    await addLog({
      content: "LED (#"+ deviceID + ") has been set to Low brightness by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Medium brightness'){
    LED[boardID][index] = 2;
    writeMQTT(LEDtopic, JSON.stringify(LED));
    await addLog({
      content: "LED (#"+ deviceID + ") has been set to Medium brightness by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'High brightness'){
    LED[boardID][index] = 3;
    writeMQTT(LEDtopic, JSON.stringify(LED));
    await addLog({
      content: "LED (#"+ deviceID + ") has been set to High brightness by the schedule",
      deviceID: deviceID
    });
  }
  // AC
  if(str == 'AC off'){
    AC[boardID][index]["power"] = 0;
    writeMQTT(ACtopic, JSON.stringify(AC));
    await addLog({
      content: "AC (#"+ deviceID + ") has been turned off by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'AC on'){
    AC[boardID][index]["power"] = 1;
    writeMQTT(ACtopic, JSON.stringify(AC));
    await addLog({
      content: "AC (#"+ deviceID + ") has been turned on by the schedule",
      deviceID: deviceID
    });
  }
  // Door
  if(str == 'Open door'){
    Door[boardID][index]["motor"] = 0;
    Door[boardID][index]["lock"] = 0;
    writeMQTT(Doortopic, JSON.stringify(Door));
    await addLog({
      content: "Door (#"+ deviceID + ") has been opened by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Close door'){
    Door[boardID][index]["motor"] = 1;
    writeMQTT(Doortopic, JSON.stringify(Door));
    await addLog({
      content: "Door (#"+ deviceID + ") has been closed by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Unlock door'){
    Door[boardID][index]["lock"] = 0;
    writeMQTT(Doortopic, JSON.stringify(Door));
    await addLog({
      content: "Door (#"+ deviceID + ") has been unlocked by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Lock door'){
    Door[boardID][index]["motor"] = 1;
    Door[boardID][index]["lock"] = 1;
    writeMQTT(Doortopic, JSON.stringify(Door));
    await addLog({
      content: "Door (#"+ deviceID + ") has been locked by the schedule",
      deviceID: deviceID
    });
  }
  // Curtain
  if(str == 'Close'){
    Curtain[boardID][index] = 0;
    writeMQTT(Curtopic, JSON.stringify(Curtain));
    await addLog({
      content: "Curtain (#"+ deviceID + ") has been closed by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Half-open'){
    Curtain[boardID][index] = 1;
    writeMQTT(Curtopic, JSON.stringify(Curtain));
    await addLog({
      content: "Curtain (#"+ deviceID + ") has been half-opened by the schedule",
      deviceID: deviceID
    });
  }
  if(str == 'Full-open'){
    Curtain[boardID][index] = 2;
    writeMQTT(Curtopic, JSON.stringify(Curtain));
    await addLog({
      content: "Curtain (#"+ deviceID + ") has been opened by the schedule",
      deviceID: deviceID
    });
  }
  // Alarm
  if(str == 'Alarm stand-by'){
    Envis = await getDocument("EnviSensor");
    selectedEnvi = Envis.find(Envi => Envi.ID == deviceID);
    await editDocumentById("EnviSensor", selectedEnvi.id, {
      setBuzzer: true
    });
    await addLog({
      content: "Alarm (#"+ deviceID + ") has been set to stand-by by the schedule",
      deviceID: deviceID
    });
    return;
  }
  if(str == 'Alarm off'){
    Envis = await getDocument("EnviSensor");
    selectedEnvi = Envis.find(Envi => Envi.ID == deviceID);
    await editDocumentById("EnviSensor", selectedEnvi.id, {
      setBuzzer: false
    })
    await addLog({
      content: "Alarm (#"+ deviceID + ") has been set to slient by the schedule",
      deviceID: deviceID
    });
    return;
  }
  return;
}


// MQTT connect
var client = mqtt.connect("mqtts://io.adafruit.com", {
  port: 8883,
  username: username,
  password: "aio_cSFh41uOGJgJ3IyiK0f0evTUtDOw",
});

client.on("connect", async () => {
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

// Examine the Schedules
const getSchedule = setInterval(async () => {
  Schedules = await getDocument("Schedule");
  Devices = await getDocument("Device");
  List = Schedules.filter(Schedule => Schedule.Time.seconds < (new Date().getTime() / 1000));
  if(List.length > 0){
    List.forEach(async element => {
      for(let i = 0; i < Devices.length; i++){
        if(Devices[i].ID == element.DeviceID){
          let collection = "Device";
          switch(Devices[i].type){
            case 1:
              collection = "LED";
              break;
            case 2:
              collection = "AC";
              break;
            case 3:
              collection = "EnviSensor";
              break;
            case 6:
              collection = "SmartCurtain";
              break;
            case 7:
              collection = "SmartDoor";
              break;
          }
          let Info = await getDocument(collection);
          let selected = Info.find(e => e.ID == element.DeviceID);
          await decodeAction(Devices[i].boardID, Devices[i].index, Devices[i].ID, element.id, element.Action);
          // Remove Schedule
          await deleteDocumentById("Schedule", element.id);
          await editDocumentById(collection, selected.id, {
            scheduleList: selected.scheduleList.filter(e => e != element.id)
          })
          if(element.Daily){
            // Add new Schedule
            let sid = await addDocument("Schedule", {
              Action: element.Action,
              Daily: true,
              DeviceID: element.DeviceID,
              Time: new Date(element.Time.toDate().getTime() + 24 * 60 * 60 * 1000)
            })
            await editDocumentById(collection, selected.id, {
              scheduleList: [...selected.scheduleList, sid]
            })
          }
          break;
        } 
      }
    });
  }
  else{
    console.log("No Schedule !");
  }
}, 1000 * ScheduleInterval);


// Listen with React Native
app.listen(port, () => {
    console.log("Server is running on port " + port);
});

// PUT request
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

// GET request
app.get('/getEnviStatus', (req, res) => {
    const boardID = req.query.boardID;
    const Dindex = req.query.Dindex;
    const Lindex = req.query.Lindex;
    const Gindex = req.query.Gindex;
    try{
      console.log(Sensor[boardID]["DHT11"][Dindex], Dindex)
      res.send({value: {
        humid: Sensor[boardID]["DHT11"][Dindex]["humid"],
        temperature: Sensor[boardID]["DHT11"][Dindex]["temperature"],
        brightness: Sensor[boardID]["LDR"][Lindex],
        gas: Sensor[boardID]["gas"][Gindex],
      } });
    }
    catch(err){
      console.log(err);
    }
})

app.get('/getLED', (req, res) => {
  const boardID = req.query.boardID
  const index = req.query.index
  res.send({ value: LED[boardID][index] })
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

// Receive MQTT message 
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
    Envis = getDocument("EnviSensor");
    let Devices = getDocument("Device");
    Envis.forEach(async element => {
      for(let i = 0; i < Devices.length; i++){
        if(Devices[i].ID == element.ID){
          if(Sensor[Devices[i].boardID]["DHT11"][element.DHT_index]["temperature"] < 50 && Sensor[Devices[i].boardID]["gas"][element.Gas_index] == 0){
            Buzzer[Devices[i].boardID][element.Buzzer_index] = 0;
            writeMQTT(Buzztopic, JSON.stringify(Buzzer));
          }
          else{
            await addLog({
              content: "Envi (#"+ element.ID + ") has detected dangerous statistic, please check your house.",
              deviceID: element.ID
            });
            if(element.setBuzzer){
              Buzzer[Devices[i].boardID][element.Buzzer_index] = 1;
              writeMQTT(Buzztopic, JSON.stringify(Buzzer));
            }
            // Add Log
          }
        }
      }
    })
    console.log(Sensor);
  }
});

// LED: {"board1":{"0":0,"1":0}}
// AC: {"board1":{"0":{"power":0,"temp":25}}}
// Buzzer: {"board1":{"0":0}}
// Envi: {"board1":{"DHT11":{"0":{"humid":64.0,"temperature":31.8}},"LDR":{"1":89},"gas":{"0":0}}}
// Door: {"board1":{"0":{"motor":1,"lock":0}}}
// Curtain: {"board1":{"0":0}}

// DHT11: ẩm/nhiệt
// LDR: ánh sáng
// Gas: khí ga
