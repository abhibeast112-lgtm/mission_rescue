import EventEmitter from "eventemitter3";

export const meshEmitter = new EventEmitter();

let scanning = false;
let intervalId: any = null;

export const startScan = async () => {
  if (scanning) return; // prevent multiple scanners

  scanning = true;
  console.log("📡 scanning for nearby devices...");

  intervalId = setInterval(() => {
    meshEmitter.emit("nodeFound", {
      id: "device_" + Math.floor(Math.random() * 100),
      lastSeen: Date.now(),
    });
  }, 5000);
};

export const stopScan = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    scanning = false;
  }
};