var Verifier = artifacts.require("./Verifier.sol");
var Regulator = artifacts.require("./Regulator.sol");
var ISAFactory = artifacts.require("./ISAFactory.sol");

module.exports = async (deployer, network, accounts) => {
    console.log('Deploying Verifier, Regulator and ISAFactory on ganache')
    const reg = accounts[0]

    console.log("test is " + test)
    await deployer.deploy(Verifier, { from: reg })
    const verifier = await Verifier.deployed()
    console.log("Verifier deployed by " + reg + " at address " + verifier.address)

    await deployer.deploy(Regulator, verifier.address, { from: reg })
    const regulator = await Regulator.deployed()
    console.log("Regulator deployed by " + reg + " at address " + regulator.address)

    await deployer.deploy(ISAFactory, regulator.address, { from: reg })
    const isaFactory = await ISAFactory.deployed()
    console.log("ISAFactory deployed by " + reg + " at address " + isaFactory.address)
};
