const express = require('express');
const app = express();

app.use(express.json());

app.listen(3002, () => {
    console.log("Server is running on port 3002");
})

app.put('/controlDoor', (req, res) => {
    const id = req.body.id;
    const isLocked = req.body.isLocked;
    const isOpen = req.body.isOpen;
    console.log(id, isLocked, isOpen);
    res.send("Received control door req");
})

app.put('/controlAlarm', (req, res) => {
    const id = req.body.id;
    const isOn = req.body.isOn;
    console.log(id, isOn);
    res.send("Received control alarm req: " + id + " " + isOn);
})

app.put('/controlCurtain', (req, res) => {
    const id = req.body.id;
    const action = req.body.action; // 0: close, 1:half, 2:full
    console.log(id, action);
    res.send("Received control curtain req: " + id + " " + action);

})

app.put('/controlLED', (req, res) => {
    const id = req.body.id;
    const isOn = req.body.isOn;
    const isAuto = req.body.isAuto;
    const brightness = req.body.brightness;
    console.log(id, isOn, isAuto, brightness);
    res.send("Received control LED req: " + id + " " + isOn + " " + isAuto + " " + brightness);
})

app.put('/controlAC', (req, res) => {
    const id = req.body.id;
    const isOn = req.body.isOn;
    const temp = req.body.temp;
    console.log(id, isOn, temp);
    res.send("Received control AC req: " + id + " " + isOn + " " + temp);
})

app.post('/addDevice', (req, res) => {
    const code = req.body.code;
    const name = req.body.dName;
    console.log(code, name);
    res.send("Add device successfully");
})