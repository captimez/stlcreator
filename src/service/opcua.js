const { OPCUAClient, AttributeIds, DataType, TimestampsToRetunr } = require("node-opcua");

const client = OPCUAClient.create({
  endpointMustExist: false,
  securityMode: "None",
  securityPolicy: "None",
  keepSessionAlive: true,
  connectionStrategy: {
    initialDelay: 1000,
    maxRetry: 1,
    maxDelay: 5000,
    maxConnectionTimeout: 10000,
    minConnectionTimeout: 1000,
  },
});

async function connectionStrategy() {
  try {
    await client.connect("opc.tcp://192.168.1.5:4840");
    console.log("Connected to OPC UA server");
  } catch (err) {
    console.error("Error connecting to OPC UA server:", err);
    throw err;
  }
}

async function readNodeValue(nodeId) {
  try {
    const session = await client.createSession();
    const dataValue = await session.read({
      nodeId: nodeId,
      attributeId: AttributeIds.Value,
    });
    console.log("Node value:", dataValue.value.value);
    await session.close();
  } catch (err) {
    console.error("Error reading node value:", err);
  }
}

async function writeNodeValue(nodeId, value) {
    try {
        const session = await client.createSession();
        const statusCode = await session.write({
        nodeId: nodeId,
        attributeId: AttributeIds.Value,
        value: {
            dataType: DataType.UInt32,
            value: value,
        },
        });
        console.log("Write status code:", statusCode);
        await session.close();
    } catch (err) {
        console.error("Error writing node value:", err);
    }
}

module.exports = {
    connectionStrategy,
    readNodeValue,
    writeNodeValue,
};