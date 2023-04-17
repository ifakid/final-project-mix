var cassandra = require("cassandra-driver")
var ports = process.env.CASS_PORTS

var username = process.env.CASS_USER
var password = process.env.CASS_PWD

const contactPoints= ports.split(',')
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