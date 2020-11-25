import './App.css';
import {useState, useEffect} from 'react';
import Plot from './Plot.js';

// 1. Whenever Parameter1 value goes greater than 3 we see at least five
// consecutive readings of 3 or above we record it as "alert1"
// 2. Once the alert has been raised, for next one hour we ignore this alert.
// 3. When the value of Parameter5 becomes 0 and stays that way for 10 readings
// we mark it as "power outage". When we see a non zero value again we mark
// it as "power on". We record the start time of power outage and end time of it.

function App() {
  const [db, setDb] = useState([]);
  const [alerts, setAlerts] = useState(0);
  const [lastAnalyzedTime, setLastAnalyzedTime] = useState(null);
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const [isPowerOut, setIsPowerOut] = useState(false);
  const [lastPowerOutage, setLastPowerOutage] = useState(null);
  const [powerOutTime, setPowerOutTime] = useState(0);

  useEffect(() => {
    const fetchDb = setInterval(() => {
      fetch('http://localhost:9000')
        .then(res =>
          res.json().then(data => {
            setDb(data);
            analyze(db);
          }),
        )
        .catch(err => console.log(err));

      if (isPowerOut) {
        console.log('incrementing power out time');
        setPowerOutTime(powerOutTime + 5 * 60);
      }
    }, 5 * 60000); // fetch every 5 minutes

    return () => clearInterval(fetchDb);
  });

  function getDate(string) {
    // 00:00:00,1995-01-01
    let year = string.slice(9, 13);
    let month = string.slice(14, 16) - 1;
    let date = string.slice(17, 20);
    let hour = string.slice(0, 2);
    let min = string.slice(3, 5);
    let sec = string.slice(6, 8);
    return new Date(year, month, date, hour, min, sec);
  }

  function analyze(currDb) {
    let currTime = `${db[db.length - 1]['TimeSent']},${
      db[db.length - 1]['DateSent']
    }`;
    setLastAnalyzedTime(currTime);
    console.log(getDate(currTime));

    // Parmeter1 and alert
    let lastFivePar1 = db.slice(-5).map(s => s['Parameter1']);

    let shouldRaiseAlert =
      db.length &&
      lastFivePar1.length === 5 &&
      lastFivePar1.filter(s => s < 3).length === 0 &&
      (!lastAlertTime ||
        Date.parse(getDate(currTime)) - Date.parse(getDate(lastAlertTime)) >=
          3600000);

    console.log('par 1s: ', lastFivePar1, shouldRaiseAlert);

    if (shouldRaiseAlert) {
      console.log('raising alert !');
      setAlerts(alerts + 1);
      setLastAlertTime(currTime);
    }

    // Parameter5 and power outage
    let lastTenPar5 = db.slice(-10).map(s => s['Parameter5']);

    let shouldDeclarePowerOutage =
      db.length &&
      lastTenPar5.length === 10 &&
      lastTenPar5.filter(s => s != 0).length === 0;

    console.log('par 5s: ', lastTenPar5, shouldDeclarePowerOutage);

    if (shouldDeclarePowerOutage) {
      console.log('declaring power outage');
      setIsPowerOut(true);
      setLastPowerOutage(currTime);
    } else {
      setIsPowerOut(false);
    }
  }

  return (
    <div className="App">
      <div className="tray">
        <p>
          <b>Alerts:</b> <br />
          {alerts}
        </p>
        <p>
          <b>Last Analyzed Time: </b> <br />
          {lastAnalyzedTime ? lastAnalyzedTime : '---'}
        </p>
        <p>
          <b>Last Power Outage: </b> <br />
          {lastPowerOutage ? lastPowerOutage : '---'}
        </p>
        <p>
          <b>Power Out Mins: </b> <br />
          {(powerOutTime / 60).toFixed(3)}
        </p>
      </div>
      <div className="legend">
        <span style={{color: 'red'}}>Parameter 1</span>
        <span style={{color: 'blue'}}>Parameter 2</span>
        <span style={{color: 'green'}}>Parameter 3</span>
      </div>
      {db.length && <Plot db={db} />}
    </div>
  );
}

export default App;
