import {Socket} from 'net';
import {DOMParser} from 'xmldom';


const createMessage = (options) => {
  const {url} = options,
        now = new Date();
  return `<?xml version="1.0"?>
<ControlMessage type="Web">
  <command>create</command>
  <name>eg-graph</name>
  <file />
  <owner>192.168.22.1</owner>
  <focus>false</focus>
  <date>${now.toISOString()}</date>
  <signature>192.168.22.1</signature>
  <ComponentId>hyperinfobot${now.toISOString()}</ComponentId>
  <ContentSource>${url}</ContentSource>
  <DisplayState>Normal</DisplayState>
  <IsSelected>false</IsSelected>
</ControlMessage>\r\n`;
};

const hyperinfo = (robot) => {
  const socket = new Socket();
  let connected = false,
      restMessage = '';

  socket.on('connect', () => {
    connected = true;
    robot.send({room: 'hyperinfo'}, 'connected');
  });

  socket.on('close', () => {
    connected = false;
    robot.send({room: 'hyperinfo'}, 'disconnected');
  });

  socket.on('data', (buffer) => {
    const messages = (restMessage + buffer.toString()).split('\r\n');
    restMessage = messages.pop();
    for (const message of messages) {
      const xml = new DOMParser().parseFromString(message, 'text/xml'),
            type = xml.getElementsByTagName('ControlMessage')[0].getAttribute('type'),
            command = xml.getElementsByTagName('command')[0].textContent;
      if (command === 'create') {
        if (type === 'Widget') {
          const name = xml.getElementsByTagName('name')[0].textContent;
          robot.send({room: 'hyperinfo'}, `opened widget ${name}`);
        } else if (type === 'Web') {
          const url = xml.getElementsByTagName('ContentSource')[0].textContent;
          robot.send({room: 'hyperinfo'}, `opened web ${url}`);
        }
      }
      if (command === 'delete') {
        if (type === 'Widget') {
          const name = xml.getElementsByTagName('name')[0].textContent;
          robot.send({room: 'hyperinfo'}, `closed widget ${name}`);
        } else if (type === 'Web') {
          const url = xml.getElementsByTagName('ContentSource')[0].textContent;
          robot.send({room: 'hyperinfo'}, `closed web ${url}`);
        }
      }
    }
  });

  robot.respond(/connect (.*) (.*)/, (msg) => {
    if (connected) {
      msg.send('already connected');
    } else {
      const host = msg.match[1],
            port = msg.match[2];
      socket.connect(port, host);
      msg.send('connecting...');
    }
  });

  robot.respond(/disconnect/, (msg) => {
    if (connected) {
      socket.end();
      msg.send('disconnecting...');
    } else {
      msg.send('not connected');
    }
  });

  robot.respond(/open (.*)/, (msg) => {
    if (connected) {
      const url = msg.match[1],
            message = createMessage({url});
      socket.write(message, 'UTF-8', () => {
        msg.send(`opened ${url}`);
      });
    } else {
      msg.send('not connected');
    }
  });
};

export default hyperinfo;
