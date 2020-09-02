const ISAFactoryContract = artifacts.require("ISAFactory");
const RegulatorContract = artifacts.require("Regulator")
const ISAContract = artifacts.require("ISA")

contract("ISAFactory", (accounts) => {

  const isaFactory = ISAFactoryContract.deployed()
  let proposal
  let isa
  let regulator

  const lenderAddress = accounts[1]
  const borrowerAddress = accounts[2]
  const isaAmount = web3.utils.toWei('10', 'ether')
  const incomePercentage = 10
  const timePeriod = 18
  const minimumIncome = web3.utils.toWei('5', 'ether')
  const paymentCap = web3.utils.toWei('20', 'ether')
  const symbol = "ABC"

  beforeEach(async () => {
    regulator = await RegulatorContract.deployed()
    proposal = await ProposalContract.new(
      lenderAddress,
      borrowerAddress,
      isaAmount,
      incomePercentage,
      timePeriod,
      minimumIncome,
      paymentCap,
      symbol,
      regulator,
      {from: lenderAddress}
    )
    isa = await ISAContract.new(
      lenderAddress,
      borrowerAddress,
      isaAmount,
      incomePercentage,
      timePeriod,
      minimumIncome,
      paymentCap,
      symbol,
      regulator,
      {from: accounts[0]}
    )
  })

  describe("getRegulatorAddress", () => {
    it("getRegulatorAddress", async () => {
      var address = isaFactory.getRegulatorAddress()
      assert(address, "Regulator address")
    })
  })

  describe("getUsersProposalNumber", () => {
    it("for lender", async () => {
      var number = await isaFactory.getUsersProposalNumber()
      assert.equal(number, 1, "User should have 1 proposal")
    })

    it("for borrower", async () => {
      var number = await isaFactory.getUsersProposalNumber()
      assert.equal(number, 1, "User should have 1 proposal")
    })
  })

  describe("getAllProposalNumber", () => {
    it("returns same for all users", async () => {
      var number = await isaFactory.getAllProposalNumber()
      assert.equal(number, 1, "There should be 1 proposal")
    })
  })

  describe("getUsersISANumber", () => {
    it("for lender", async () => {
      var number = await isaFactory.getUsersISANumber()
      assert.equal(number, 1, "User should have 1 isa")
    })

    it("for borrower", async () => {
      var number = await isaFactory.getUsersISANumber()
      assert.equal(number, 1, "User should have 1 isa")
    })
  })

  describe("getAllISANumber", () => {
    it("returns same for all users", async () => {
      var number = await isaFactory.getAllISANumber()
      assert.equal(number, 1, "There should be 1 ias")
    })
  })
}
