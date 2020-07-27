var Verifier = artifacts.require("./Verifier.sol");
var Regulator = artifacts.require("./Regulator.sol");
var ISAFactory = artifacts.require("./ISAFactory.sol");

module.exports = async (deployer, network, accounts) => {
    console.log('Deploying Verifier, Regulator and ISAFactory on ganache')

    await deployer.deploy(Verifier)
    const verifier = await Verifier.deployed()
    console.log("Verifier deployed at address " + verifier.address)

    await deployer.deploy(Regulator, verifier.address)
    const regulator = await Regulator.deployed()
    console.log("Regulator deployed at address " + regulator.address)

    await deployer.deploy(ISAFactory, regulator.address)
    const isaFactory = await ISAFactory.deployed()
    console.log("ISAFactory deployed at address " + isaFactory.address)
};
