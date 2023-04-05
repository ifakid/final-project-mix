var cassandra = require("cassandra-driver")
var port1 = process.env.CASS_PORT1
var port2 = process.env.CASS_PORT2
var port3 = process.env.CASS_PORT3

var username = process.env.CASS_USER
var password = process.env.CASS_PWD

const contactPoints= [port1, port2, port3]
const authProvider = new cassandra.auth.PlainTextAuthProvider(
    username,
    password
);

const client = new cassandra.Client({
    contactPoints: contactPoints,
    localDataCenter: 'datacenter1',
    authProvider: authProvider,
    keyspace: 'ta_keyspace',
});

client.connect(function (err,result) {
    console.log("Connected to Cassandra")
})

module.exports = client